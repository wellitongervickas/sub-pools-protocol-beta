// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {Manager} from '../manager/Manager.sol';

contract RouterManager is IRouterManager, Manager {
    /// @inheritdoc IRouterManager
    INodeFactory public override nodeFactory;

    /**
     * @notice construct the router contract
     * @param nodeFactoryAddress_ address of the node factory
     */
    constructor(address nodeFactoryAddress_) Manager(msg.sender) {
        _updateNodeFactory(nodeFactoryAddress_);
    }

    /// @inheritdoc IRouterManager
    function updateNodeFactory(address nodeFactoryAddress_) public override onlyManager(address(this)) {
        _updateNodeFactory(nodeFactoryAddress_);
        emit IRouterManager.RouterManager_NodeFactoryUpdated(nodeFactoryAddress_);
    }

    /**
     * @notice update the node factory
     * @param nodeFactoryAddress_ address of the node factory
     */
    function _updateNodeFactory(address nodeFactoryAddress_) private {
        nodeFactory = INodeFactory(nodeFactoryAddress_);
    }
}
