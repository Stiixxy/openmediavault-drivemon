Ext.define("OMV.module.admin.service.drivemon.DeviceStateGrid", {
    extend: "OMV.workspace.grid.Panel",
    alias: "widget.deviceStateGrid",

    id: "deviceStateGrid",
    hideDeleteButton: true,
    hideAddButton: true,
    hideEditButton: true,

    rpcService: "Drivemon",
    rpcGetMethod: "getDriveStatus",
    requires: [
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc"
    ],

    stateful: true,
    stateId: "b06cd0b8-39f7-11ea-a137-2e728ce88125",

    defaults: {
        flex: 1
    },

    columns: [{
        xtype: "enabledcolumn",
        text: _("On"),
        sortable: true,
        dataIndex: "enabled",
        stateId: "enabled"
    }, {
        xtype: "textcolumn",
        text: _("Name"),
        dataIndex: 'name',
        sortable: true,
        stateId: 'name',
    }, {
        xtype: "textcolumn",
        text: _("State"),
        dataIndex: 'state',
        sortable: true,
        stateId: 'state',
    }],

    initComponent: function () {
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
                        service: "Drivemon",
                        method: "getDriveStatus",
                    }
                }
            })
        });
        me.callParent(arguments);
    },

    getTopToolbarItems: function(c) {
        var me = this;
        return [{
            id: me.getId() + "-shutdown",
            xtype: "button",
            text: _("Shutdown"),
            icon: "images/shutdown.png",
            iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
            disabled: true,
            handler: Ext.Function.bind(me.onShutdownButton, me, [ me ]),
            scope: me
        },{
            id: me.getId() + "-refresh",
            xtype: "button",
            text: _("Refresh"),
            icon: "images/refresh.png",
            iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
            disabled: false,
            handler: Ext.Function.bind(me.onRefreshButton, me, [ me ]),
            scope: me
        },
        ]
    },

    onShutdownButton: function() {
        var me = this;
        var sm = me.getSelectionModel();
        var selRecords = sm.getSelection();
        var driveList = "";
        for(i = 0; i < selRecords.length; i++) {
            if(i === 0) {
                driveList = selRecords[i].get("name");
            } else {
                driveList = driveList + " " + selRecords[i].get("name");
            }
        }

        OMV.Rpc.request({
            scope: me,
            callback: function(id, succcess){
                if(succcess){
                    Ext.getCmp("deviceStateGrid").doReload();
                }
            },
            rpcData: {
                service: "Drivemon",
                method: "shutdownDrive",
                params: {
                    drivelist: driveList
                }
            }
        });
    },

    onRefreshButton: function(){
        Ext.getCmp("deviceStateGrid").doReload();
    },

    onSelectionChange: function(model, records) {
        var me = this;
        
        var tbarBtnName = [ "shutdown" ];
        var tbarBtnDisabled = {
            "shutdown": true,
        };

        // Enable/disable buttons depending on the number of selected rows.
        if(records.length > 0) {
            tbarBtnDisabled["shutdown"] = false;
        }

        Ext.Array.each(tbarBtnName, function(name) {
            var tbarBtnCtrl = me.queryById(me.getId() + "-" + name);
            if(!Ext.isEmpty(tbarBtnCtrl)) {
                if(true == tbarBtnDisabled[name]) {
                    tbarBtnCtrl.disable();
                } else {
                    tbarBtnCtrl.enable();
                }
            }
        });
    }
});


OMV.WorkspaceManager.registerPanel({
    id: "driveState",
    path: "/service/drivemon",
    text: _("Device state"),
    position: 15,
    className: "OMV.module.admin.service.drivemon.DeviceStateGrid"
});