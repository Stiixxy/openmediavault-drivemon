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
                xtype: 'checkboxgridfield',
                name: 'drives',
                fieldLabel: _('Drives'),
                valueField: "name",
                useStringValue: true,
                minHeight: 170,

                store: Ext.create("OMV.data.Store", {
                    autoLoad: true,
                    model: OMV.data.Model.createImplicit({
                        idProperty: "name",
                        fields: [
                            { name: "name", type: "string" },
                        ]
                    }),
                    proxy: {
                        type: "rpc",
                        appendSortParams: false,
                        rpcData: {
                            service: "drivemon",
                            method: "getPossibleDrives"
                        }
                    },
                    sorters: [{
                        direction: "ASC",
                        property: "name"
                    }]
                }),
                gridConfig: {
                    stateful: true,
                    stateId: "fd292216-41fa-11ea-b77f-2e728ce88125",
                    columns: [{
                        xtype: "emptycolumn",
                        text: _("Drive"),
                        sortable: true,
                        dataIndex: "name",
                        stateId: "name",
                        flex: 1
                    }]
                },
                plugins: [{
                    ptype: "fieldinfo",
                    text: _("Select the devices that you want to show and monitor")
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
