# -*- coding: utf-8 -*-
#
# This file is part of OpenMediaVault.
#
# @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
# @author    Volker Theile <volker.theile@openmediavault.org>
# @copyright Copyright (c) 2009-2019 Volker Theile
#
# OpenMediaVault is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# any later version.
#
# OpenMediaVault is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
import openmediavault.mkrrdgraph
import openmediavault.subprocess
import openmediavault.rpc

class Plugin(openmediavault.mkrrdgraph.IPlugin):
    def create_graph(self, config):
        drives = openmediavault.rpc.call("Drivemon", "getSettings")['drives']
        for c in drives:
            # http://paletton.com/#uid=33r0-0kwi++bu++hX++++rd++kX
            drivename = '/dev/sd' + c
            config.update(
                {
                    'title_drive': drivename,
                    'config_blue': '#0bb6ff',  # blue
                    'drive_letter': c
                }
            )
            args = []
            # yapf: disable
            # pylint: disable=line-too-long
            args.append('{image_dir}/drivestate-_dev_sd{drive_letter}-{period}.png'.format(**config))
            args.extend(config['defaults'])
            args.extend(['--start', config['start']])
            args.extend(['--title', '"{title_drive}{title_by_period}"'.format(**config)])
            args.append('--slope-mode')
            args.extend(['--lower-limit', '-0.5'])
            args.extend(['--upper-limit', '1.5'])
            args.extend(['--units-exponent', '0'])
            args.append('DEF:stateavg={data_dir}/drivemon-_dev_sd{drive_letter}/gauge-state.rrd:value:LAST'.format(**config))

            args.append('LINE2:stateavg{config_blue}:"active"'.format(**config))
            args.append('GPRINT:stateavg:AVERAGE:"%4.2lf Avg"')
            args.append('GPRINT:stateavg:LAST:"%4.2lf Last\l"')

            args.append('COMMENT:"{last_update}"'.format(**config))
            # yapf: enable
            openmediavault.mkrrdgraph.call_rrdtool_graph(args)
        return 0
