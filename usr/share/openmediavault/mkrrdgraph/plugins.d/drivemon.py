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


class Plugin(openmediavault.mkrrdgraph.IPlugin):
    def create_graph(self, config):
        # http://paletton.com/#uid=33r0-0kwi++bu++hX++++rd++kX
        config.update(
            {
                'title_load': 'Drive state',
                'color_load_shortterm': '#ffbf00',  # yellow
                'color_load_midterm': '#0bb6ff',  # blue
                'color_load_longterm': '#ff1300',  # red
            }
        )
        args = []
        # yapf: disable
        # pylint: disable=line-too-long
        args.append('{image_dir}/drivestate-{period}.png'.format(**config))
        args.extend(config['defaults'])
        args.extend(['--start', config['start']])
        args.extend(['--title', '"{title_load}{title_by_period}"'.format(**config)])
        args.append('--slope-mode')
        args.extend(['--lower-limit', '0'])
        args.extend(['--units-exponent', '0'])
        args.append('DEF:stateavg={data_dir}/drivemon/gauge-state.rrd:value:LAST'.format(**config))
        args.append('DEF:statemin={data_dir}/drivemon/gauge-state.rrd:value:MIN'.format(**config))
        args.append('DEF:sstatemax={data_dir}/drivemon/gauge-state.rrd:value:MAX'.format(**config))

        args.append('LINE1:stateavg{color_load_shortterm}:" 1 min"'.format(**config))
        args.append('GPRINT:statemin:MIN:"%4.2lf Min"')
        args.append('GPRINT:stateavg:AVERAGE:"%4.2lf Avg"')
        args.append('GPRINT:sstatemax:MAX:"%4.2lf Max"')
        args.append('GPRINT:stateavg:LAST:"%4.2lf Last\l"')

        args.append('COMMENT:"{last_update}"'.format(**config))
        # yapf: enable
        openmediavault.mkrrdgraph.call_rrdtool_graph(args)
        return 0
