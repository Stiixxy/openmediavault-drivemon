Ext.define("OMV.module.admin.service.drivemon.DeviceStateGrid", {
    extend: "OMV.workspace.grid.Panel",
	requires: [
		"OMV.Rpc",
		"OMV.data.Store",
		"OMV.data.Model",
		"OMV.data.proxy.Rpc"
	],

    autoReload: true,
	rememberSelected: true,
	disableLoadMaskOnLoad: true,
	hideAddButton: true,
	hideEditButton: true,
	hideRefreshButton: true,
	hidePagingToolbar: false,
    
	stateful: true,
    stateId: "b06cd0b8-39f7-11ea-a137-2e728ce88125",

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
                autoLoad: true,
                model: OMV.data.Model.createImplicit({
                    idProperty: "name",
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
                },
                remoteSort: true,
				sorters: [{
					direction: "ASC",
					property: "name"
				}]
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
            handler: me.onShutdownButton,
            scope: me,
            selectionConfig: {
                minSelections: 1
            }
        },{
            id: me.getId() + "-refresh",
            xtype: "button",
            text: _("Refresh"),
            icon: "images/refresh.png",
            iconCls: Ext.baseCSSPrefix + "btn-icon-16x16",
            disabled: false,
            handler: me.onRefreshButton,
            scope: me
        }]
    },

    onShutdownButton: function() {
        var me = this;
        
        var selRecords = me.getSelection();
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
                    var me = this;
                    me.doReload();
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
        var me = this;
        me.doReload();
    },
});


OMV.WorkspaceManager.registerPanel({
    id: "driveState",
    path: "/service/drivemon",
    text: _("Device state"),
    position: 15,
    className: "OMV.module.admin.service.drivemon.DeviceStateGrid"
});