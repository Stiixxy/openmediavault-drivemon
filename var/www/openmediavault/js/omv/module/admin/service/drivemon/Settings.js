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
