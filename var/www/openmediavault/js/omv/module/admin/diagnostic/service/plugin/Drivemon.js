/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2020 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/workspace/tab/Panel.js")
// require("js/omv/workspace/panel/Textarea.js")
// require("js/omv/workspace/panel/RrdGraph.js")

Ext.define("OMV.module.admin.diagnostic.service.plugin.Drivemon", {
    extend: "OMV.workspace.tab.Panel",
    alias: "omv.plugin.diagnostic.service.drivemon",
    requires: [
        "OMV.Rpc"
    ],

    title: _("Drivemon"),

    initComponent: function() {
        var me = this;
        me.items = [];
        me.callParent(arguments);

        // Execute RPC to get the information required to add tab panels.
        OMV.Rpc.request({
            callback: function(id, success, response) {
                var drives = response['drives'];
                // Create a RRD graph panel per drive.
                drives = drives.split(',');
                for(var name of drives) {
                    me.add(Ext.create("OMV.workspace.panel.RrdGraph", {
                        title: name,
                        rrdGraphName: "drivestate-" + name.replace(/\//g, "_")
                    }));
                }
            },
            relayErrors: false,
            rpcData: {
                service: "Drivemon",
                method: "getSettings"
            }
        });
    }
});