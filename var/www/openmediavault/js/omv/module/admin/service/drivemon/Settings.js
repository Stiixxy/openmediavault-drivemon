Ext.define('OMV.module.admin.service.drivemon.Settings', {
    extend: 'OMV.workspace.form.Panel',
    
    rpcService: 'Drivemon',
    rpcGetMethod: 'getSettings',
    rpcSetMethod: 'setSettings',

    getFormItems: function() {
        return [{
            xtype: 'fieldset',
            title: _('General'),
            fieldDefaults: {
                labelSeparator: ''
            },
            items: [{
                xtype: 'textfield',
                name: 'drives',
                fieldLabel: _('Drives'),
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("Last letters of drive names as 1 string. So /dev/sda = a & /dev/sda, /dev/sdb, /dev/sdf = abf")
                }]
            }]
        }];
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "settings",
    path: "/service/drivemon",
    text: _("Settings"),
    position: 100,
    className: "OMV.module.admin.service.drivemon.Settings"
});
