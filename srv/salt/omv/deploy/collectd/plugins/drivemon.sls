{% set config = salt['omv_conf.get']('conf.service.drivemon') %}
{% set user = salt['cmd.run']('id -nu 1000') %}
{% set group = salt['cmd.run']('id -ng 1000') %}

{% if config.drives != '' %}

configure_collectd_conf_drivemon_plugin:
  file.managed:
    - name: "/etc/collectd/collectd.conf.d/drivemon.conf"
    - contents: |
        LoadPlugin exec
        <Plugin exec>
            Exec "{{user}}:{{group}}" "/bin/get_hdparm" "{{config.drives}}"
        </Plugin>

{% else %}

configure_collectd_conf_drivemon_plugin:
  file.absent:
    - name: "/etc/collectd/collectd.conf.d/drivemon.conf"

{% endif %}