Ext.define("OMV.module.admin.service.example.DeviceStateGrid", {
    extend: "OMV.workspace.grid.Panel",
    alias: "widget.deviceStateGrid",

    id: "deviceStateGrid",
    hideDeleteButton: true,
    hideAddButton: true,
    hideEditButton: true,
    
    rpcService: "Example",
    rpcGetMethod: "getDriveStatus",
    requires: [
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc"
    ],

    stateful: true,
    stateId: "a458e082-8422-4564-a679-a47d9d001d0f",

    defaults: {
        flex: 1
    },

    columns: [{
        xtype: "textcolumn",
        text: _("Name"),
        dataIndex: 'name',
        sortable: true,
        stateId: 'name',
    },{
        xtype: "textcolumn",
        text: _("State"),
        dataIndex: 'state',
        sortable: true,
        stateId: 'state',
    }],

    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            store: Ext.create("OMV.data.Store", {
                pageSize: 10,
                autoLoad: true,
                model: OMV.data.Model.createImplicit({
                    fields: [
                        { name: "name", type: "string" },
                        { name: "state", type: "string" },
                    ]
                }),
                proxy: {
                    type: "rpc",
                    rpcData: {
                        service: "Example",
                        method: "getDriveStatus",
                    }
                }
            })
        });
        me.callParent(arguments);
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "driveState",
    path: "/service/example",
    text: _("Device state"),
    position: 15,
    className: "OMV.module.admin.service.example.DeviceStateGrid"
});