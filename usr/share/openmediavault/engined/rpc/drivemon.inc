<?php

use OMV\ErrorMsgException;
use OMV\Exception;
use OMV\Rpc\ServiceAbstract;
use OMV\Engine\Notify;
use OMV\Config\ConfigObject;
use OMV\Config\Database;
use OMV\Engine\Notify\Dispatcher;
use OMV\System\Process;
use OMV\Rpc\Rpc;

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

        // Because of mkconf drives MUST stay the first return value
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

        $moduleMngr = \OMV\Engine\Module\Manager::getInstance();
        $moduleMngr->getModule("collectd")->setDirty();

        return $object;
	}


}
