Ext.define('OMV.module.admin.service.example.Dashboard', {
    extend: 'OMV.workspace.form.Panel',

    // This path tells which RPC module and methods this panel will call to get 
    // and fetch its form values.
    rpcService: 'Example',
    rpcGetMethod: 'getDashboard',

    initComponent: function () {
        this.on("afterrender", function () {
            var me = this;
            var parent = this.up("tabpanel");

            if (!parent) {
                return;
            }

            var dashboardPanel = parent.down("panel[title=" + _("Dashboard") + "]");
            var examplePanel = parent.down("panel[title=" + _("Settings") + "]");
            var checked = examplePanel.findField("enable").checked

            if (dashboardPanel) {
                if (!checked) {
                    parent.setActiveTab(examplePanel);
                }
            }

        }, this);

        this.callParent(arguments);
    },

    onCreateButton: function () {
        console.log("running create RPC call");
        var me = this;

        var parent = this.up("tabpanel");

        if (!parent) {
            return;
        }

        var dashPanel = parent.down("panel[title=" + _("Settings") + "]");
        var drives = dashPanel.findField("drives").rawValue;
        console.log(drives);

        OMV.Rpc.request({
            scope: me,
            callback: function(id, succcess, response){
                console.log("got response from RPC", id, succcess, response);
            },
            rpcData: {
                service: "Example",
                method: "getDriveStatus",
                params: {
                    drives: drives
                }
            }
        });
    },

    // getFormItems is a method which is automatically called in the 
    // instantiation of the panel. This method returns all fields for 
    // the panel.
    getFormItems: function () {
        var me = this;
        return [{
            // xtype defines the type of this entry. Some different types
            // is: fieldset, checkbox, textfield and numberfield. 
            xtype: 'fieldset',
            title: _('General'),
            fieldDefaults: {
                labelSeparator: ''
            },
            // The items array contains items inside the fieldset xtype.
            items: [{
                xtype: 'checkbox',
                // The name option is sent together with is value to RPC
                // and is also used when fetching from the RPC.
                name: 'set',
                fieldLabel: _('Set'),
                // checked sets the default value of a checkbox.
                checked: false
            }, 
            {
                id: "create",
                xtype: "button",
                text: _("Create"),
                disabled: false,
                handler: Ext.Function.bind(me.onCreateButton, me, [me]),
                scope: me
            }]
        }];
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "dashboard",
    path: "/service/example",
    text: _("Dashboard"),
    position: 10,
    className: "OMV.module.admin.service.example.Dashboard"
});
