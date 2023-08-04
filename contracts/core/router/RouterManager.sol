// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {Manager} from '../manager/Manager.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {IStrategyProxyFactory} from '../interfaces/strategyProxy/IStrategyProxyFactory.sol';
import {IStrategyProxy} from '../interfaces/strategyProxy/IStrategyProxy.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract RouterManager is IRouterManager, Manager {
    /// @inheritdoc IRouterManager
    INodeFactory public override nodeFactory;

    /// @inheritdoc IRouterManager
    IStrategyProxyFactory public override strategyProxyFactory;

    /**
     * @notice construct the router contract
     * @param nodeFactoryAddress_ address of the node factory
     * @param strategyFactory_ address of the strategy proxy factory
     */
    constructor(INodeFactory nodeFactoryAddress_, IStrategyProxyFactory strategyFactory_) Manager(msg.sender) {
        _updateNodeFactory(nodeFactoryAddress_);
        _updateStrategyProxyFactory(strategyFactory_);
    }

    /// @inheritdoc IRouterManager
    function updateNodeFactory(INodeFactory nodeFactoryAddress_) public override onlyManager(address(this)) {
        _updateNodeFactory(nodeFactoryAddress_);
        emit IRouterManager.RouterManager_NodeFactoryUpdated(address(nodeFactoryAddress_));
    }

    /// @inheritdoc IRouterManager
    function updateStrategyProxyFactory(
        IStrategyProxyFactory strategyFactory_
    ) public override onlyManager(address(this)) {
        _updateStrategyProxyFactory(strategyFactory_);
        emit IRouterManager.RouterManager_StrategyProxyFactoryUpdated(address(strategyFactory_));
    }

    function _updateNodeFactory(INodeFactory nodeFactoryAddress_) private {
        nodeFactory = INodeFactory(nodeFactoryAddress_);
    }

    function _updateStrategyProxyFactory(IStrategyProxyFactory strategyFactory_) private {
        strategyProxyFactory = strategyFactory_;
    }

    /**
     * @notice deploy a new node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @param parentAddress_ the address of the parent node
     * @return the address of the node
     */
    function _buildNode(address[] memory invitedAddresses_, address parentAddress_) internal returns (address) {
        address _nodeAddress = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_);
        return _nodeAddress;
    }

    /**
     * @notice deploy a new strategy proxy
     * @param strategyAddress_ the address of the strategy
     * @return the address of the strategy proxy
     */
    function _buildStrategyProxy(IStrategy strategyAddress_) internal returns (address) {
        address _strategyProxyAddress = strategyProxyFactory.build(strategyAddress_);
        return _strategyProxyAddress;
    }
}
