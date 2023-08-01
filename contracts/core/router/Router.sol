// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {Manager} from '../manager/Manager.sol';

contract Router is IRouter, Manager {
    INodeFactory public nodeFactory;

    constructor(address _nodeFactoryAddress) Manager(msg.sender) {
        _updateNodeFactory(_nodeFactoryAddress);
    }

    function updateNodeFactory(address _nodeFactoryAddress) public onlyManager(address(this)) {
        _updateNodeFactory(_nodeFactoryAddress);
        emit IRouter.NodeFactory_Updated(_nodeFactoryAddress);
    }

    function _updateNodeFactory(address _nodeFactoryAddress) private {
        nodeFactory = INodeFactory(_nodeFactoryAddress);
    }
}
