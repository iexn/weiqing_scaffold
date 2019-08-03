<?php
namespace wsys\logic;

class GroupLogic extends CommonConditionLogic 
{
    protected $model_class = 'Group';

    public function detail()
    {
        return false;
    }

}