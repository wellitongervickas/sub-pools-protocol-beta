// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterManager} from './RouterManager.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {IStrategyProxyFactory} from '../interfaces/strategyProxy/IStrategyProxyFactory.sol';

contract Router is IRouter, RouterManager {
    /// @dev see IRouterManager
    constructor(
        INodeFactory _nodeFactoryAddress,
        IStrategyProxyFactory strategyProxyFactory_
    ) RouterManager(_nodeFactoryAddress, strategyProxyFactory_) {}

    /// @dev Modifier to check if the node is registered
    modifier onlyRegisteredNode(address nodeAddress_) {
        if (!nodes(INode(nodeAddress_))) revert IRouter.Router_OnlyRegisteredNode();
        _;
    }

    /// @inheritdoc IRouter
    function createNode(address[] memory invitedAddresses_) public override returns (address) {
        ///@dev zero address when root
        address nodeAddress = _buildNode(invitedAddresses_, address(0));

        emit IRouter.Router_NodeCreated(nodeAddress);

        return nodeAddress;
    }

    /// @inheritdoc IRouter
    function joinNode(
        address parentNodeAddress_,
        address[] memory invitedAddresses_
    ) external override onlyRegisteredNode(parentNodeAddress_) returns (address) {
        INode parent = INode(parentNodeAddress_);

        address _nodeAddress = _buildNode(invitedAddresses_, parentNodeAddress_);
        /// @dev node will check child invitation
        parent.join(_nodeAddress, msg.sender);

        emit IRouter.Router_NodeJoined(parentNodeAddress_, _nodeAddress);

        return _nodeAddress;
    }
}
