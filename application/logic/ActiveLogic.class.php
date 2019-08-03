<?php 
namespace wsys\logic;

class ActiveLogic extends CommonConditionLogic
{
    protected $model_class = 'Active';

    protected $action = [
        'detail' => '@detail::'
    ];

}