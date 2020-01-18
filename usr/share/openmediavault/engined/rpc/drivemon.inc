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
class OMVRpcServiceDrivemon extends ServiceAbstract
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
        return "org.openmediavault.services.drivemon";
    }

    /**
     * Get the name of the RPC service
     *
     * @return string
     */
    public function getName()
    {
        return "Drivemon";  // RPC Service name. Same as in .js files
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
		$this->registerMethod('getDriveStatus');
		$this->registerMethod('shutdownDrive');
    }

    public function getDriveStatus($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
        );
        
        $settings=$this->database->getAssoc($this->dataModelPath);
        $settings["drives"] = $settings["drives"];

        $result = [];

        $output = shell_exec("hdparm -C /dev/sd[" . $settings["drives"] . "]");
        $lines = explode("\n", $output);
        for($i = 0; $i + 3 <= count($lines); $i += 3){
            $name = (string)$lines[$i + 1];
            $name = str_replace(":", "", $name);

            $state = (string)$lines[$i + 2];
            $state = str_replace(" drive state is:  ", "", $state);

            array_push($result, [
                "enabled" => boolval($state == "active/idle"),
                "name" => $name,
                "state" => $state
            ]);
        }

        return $result;
    }

    public function shutdownDrive($params, $context){
        $this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
        );
        
        $object = array(
            "drivelist" => $params['drivelist']
        );

        shell_exec("hdparm -y " . $object["drivelist"]);
    }
    
	public function getSettings($params, $context)
	{
		$this->validateMethodContext(
            $context,
            array("role" => OMV_ROLE_ADMINISTRATOR)
		);
		
		$settings=$this->database->getAssoc($this->dataModelPath);

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
				'        "drives": {' .
				'            "type": "string"' .
				'        }' .
				'    }' .
				'}' 				
		);
		
		$object = array(
            "drives" => $params['drives']
        );

        if(!preg_match("/\A[a-zA-Z]*\Z/", $object["drives"])) 
            throw new Exception("Drives must be a string of caracters");

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
