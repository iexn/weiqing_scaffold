<?php
namespace wsys\logic;
use wsys\Controller;

class CommonLogic extends Controller
{
    public function __construct()
    {
        
    }

    protected function getModelClass($name)
    {
        return '\\wsys\\model\\'.$name.'Model';
    }

}
