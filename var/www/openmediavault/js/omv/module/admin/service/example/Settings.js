Ext.define('OMV.module.admin.service.example.Settings', {
    extend: 'OMV.workspace.form.Panel',
    
    // This path tells which RPC module and methods this panel will call to get 
    // and fetch its form values.
    rpcService: 'Example',
    rpcGetMethod: 'getSettings',
    rpcSetMethod: 'setSettings',

    // getFormItems is a method which is automatically called in the 
    // instantiation of the panel. This method returns all fields for 
    // the panel.
    getFormItems: function() {
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
                xtype: 'textfield',
                name: 'drives',
                fieldLabel: _('Drives'),
            }]
        }];
    }
});

// Register a panel into the GUI.
//
// path: 
//     We want to add the panel in our example node. 
//     The node was configured with the path /service and the id example.
//     The path is therefore /service/example.
//
// className: 
//     The panel which should be registered and added (refers to 
//     the class name).
OMV.WorkspaceManager.registerPanel({
    id: "settings",
    path: "/service/example",
    text: _("Settings"),
    position: 100,
    className: "OMV.module.admin.service.example.Settings"
});
