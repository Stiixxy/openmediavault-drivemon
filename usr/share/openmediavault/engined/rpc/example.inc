<?php
/**
 * Copyright (c) 2015-2019 OpenMediaVault Plugin Developers
 *
 * @category OMVRpcServiceDocker
 * @package  Openmediavault-docker-gui
 * @author   OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     https://github.com/OpenMediaVault-Plugin-Developers/openmediavault-docker-gui
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
require_once "openmediavault/object.inc";
require_once "openmediavault/config.inc";
require_once "openmediavault/error.inc";
require_once "openmediavault/util.inc";
require_once "openmediavault/rpcservice.inc";
require_once "openmediavault/notify.inc";
*/

use OMV\ErrorMsgException;
use OMV\Exception;
use OMV\Rpc\ServiceAbstract;
use OMV\Engine\Notify;
use OMV\Config\ConfigObject;
use OMV\Config\Database;
use OMV\Engine\Notify\Dispatcher;
use OMV\System\Process;
use OMV\Rpc\Rpc;

//use OMV\Rpc\ServiceManager;

/**
 * RPC class for the Docker GUI plugin
 *
 * @category Class
 * @package  Openmediavault-docker-gui
 * @author   OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @license  http://www.gnu.org/copyleft/gpl.html GNU General Public License
 * @link     https://github.com/OpenMediaVault-Plugin-Developers/openmediavault-docker-gui
 *
 */
class OMVRpcServiceExample extends ServiceAbstract
{
	private $dataModelPath = 'conf.service.drivemon';
	
	public function __construct(Database $database = null, Dispatcher $dispatcher = null){
        $this->database = $database ?: Database::getInstance();
        $this->dispatcher = $dispatcher ?: Dispatcher::getInstance();
	}
	
	/**
     * Get the main event message path of the service. This is a helper
     * function to avoid "magic numbers".
     *
     * @return string
     */
    private function _getEventMessagePath()
    {
        return "org.openmediavault.services.example";
    }

    /**
     * Get the name of the RPC service
     *
     * @return string
     */
    public function getName()
    {
        return "Example";  // RPC Service name. Same as in .js files
    }

    /**
     * Initialize the RPC service. Different methods of the RPC service are
     * declared here
     *
     * @return void
     */
    public function initialize()
	{
		$this->registerMethod('getSettings');
		$this->registerMethod('setSettings');
		$this->registerMethod('getDashboard');
		$this->registerMethod('getDriveStatus');
    }

    public function getDriveStatus($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
        );
        
        $object = array(
            "drives" => $params["drives"]
        );

        $output = shell_exec("hdparm -C " . $object["drives"]);

        $result = array(
            "output" => $output
        );

        return $result;
    }
    
	public function getDashboard($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
		);
		
		$settings=array();

        $settings["set"] = true;

        return $settings;
    }

	public function getSettings($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
		);
		
		$settings=$this->database->getAssoc($this->dataModelPath);

        $settings["enable"] = boolval($settings["enable"]);
        $settings["drives"] = $settings["drives"];

        return $settings;
    }
    
	public function setSettings($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
		);
		$this->validateMethodParams(
            $params,
                '{' .
				'    "type": "object",' .
				'    "properties": {' .
				'        "enable": {' .
				'            "type": "boolean"' .
				'        },' .
				'        "drives": {' .
				'            "type": "string"' .
				'        }' .
				'    }' .
				'}' 				
		);
		
		$object = array(
            "enable" => array_boolval($params, "enable"),
            "drives" => $params['drives']
        );

		$config = new ConfigObject($this->dataModelPath);
        $config->setAssoc($object);
        $this->database->set($config);

        $this->dispatcher->notify(
            OMV_NOTIFY_MODIFY,
            $this->_getEventMessagePath(),
            $object
        );

        return $object;
	}


}
