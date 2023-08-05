// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {Manager} from '../manager/Manager.sol';
import {INode} from '../interfaces/node/INode.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {IStrategyProxyFactory} from '../interfaces/strategy/IStrategyProxyFactory.sol';
import {IStrategyProxy} from '../interfaces/strategy/IStrategyProxy.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract RouterManager is IRouterManager, Manager {
    /// @inheritdoc IRouterManager
    INodeFactory public override nodeFactory;

    /// @inheritdoc IRouterManager
    IStrategyProxyFactory public override strategyProxyFactory;

    /// @dev mapping of the registered nodes
    mapping(INode => bool) private _nodes;

    /// @dev mapping of the registered strategy proxies
    // mapping(IStrategyProxy => bool) private _strategyProxies;

    /**
     * @notice construct the router contract
     * @param nodeFactory_ address of the node factory
     * @param strategyFactory_ address of the strategy proxy factory
     */
    constructor(INodeFactory nodeFactory_, IStrategyProxyFactory strategyFactory_) Manager(msg.sender) {
        _updateNodeFactory(nodeFactory_);
        _updateStrategyProxyFactory(strategyFactory_);
    }

    /**
     * @notice update the node factory
     * @param nodeFactory_ address of the node factory
     */
    function _updateNodeFactory(INodeFactory nodeFactory_) private {
        nodeFactory = nodeFactory_;
    }

    /**
     * @notice update the strategy proxy factory
     * @param strategyFactory_ address of the strategy proxy factory
     */
    function _updateStrategyProxyFactory(IStrategyProxyFactory strategyFactory_) private {
        strategyProxyFactory = strategyFactory_;
    }

    /// @inheritdoc IRouterManager
    function updateNodeFactory(INodeFactory nodeFactory_) external override onlyManager(address(this)) {
        _updateNodeFactory(nodeFactory_);
        emit IRouterManager.RouterManager_NodeFactoryUpdated(address(nodeFactory_));
    }

    /// @inheritdoc IRouterManager
    function updateStrategyProxyFactory(
        IStrategyProxyFactory strategyFactory_
    ) external override onlyManager(address(this)) {
        _updateStrategyProxyFactory(strategyFactory_);
        emit IRouterManager.RouterManager_StrategyProxyFactoryUpdated(address(strategyFactory_));
    }

    /**
     * @notice deploy a new node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @param parentAddress_ the address of the parent node
     * @return the address of the node
     */
    function _buildNode(address[] memory invitedAddresses_, address parentAddress_) internal returns (address) {
        address nodeAddress = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_);

        _registryNode(INode(nodeAddress));

        return nodeAddress;
    }

    /**
     * @notice registry a node
     * @param nodeAddress_ the address of the node
     */
    function _registryNode(INode nodeAddress_) private {
        /// @dev do not required a manual trust since the node factory is trusted
        _setNodeTrust(nodeAddress_, true);
    }

    /**
     * @notice set the status of the node registry
     * @param nodeAddress_ the address of the node
     * @param isTrusted_ the status of the node
     */
    function _setNodeTrust(INode nodeAddress_, bool isTrusted_) private {
        _nodes[nodeAddress_] = isTrusted_;
    }

    /// @inheritdoc IRouterManager
    function trustNode(INode node_, bool isTrusted_) external override onlyManager(address(this)) {
        _setNodeTrust(node_, isTrusted_);

        emit IRouterManager.RouterManager_NodeTrust(node_, isTrusted_);
    }

    /// @inheritdoc IRouterManager
    function nodes(INode nodeAddress_) public view override returns (bool) {
        return _nodes[INode(nodeAddress_)];
    }

    /// @inheritdoc IRouterManager
    // function trustStrategyProxy(IStrategyProxy strategyProxy_, bool isTrusted_) external onlyManager(address(this)) {
    //     _setStrategyProxyTrust(strategyProxy_, isTrusted_);

    //     emit IRouterManager.RouterManager_StrategyProxyTrust(strategyProxy_, isTrusted_);
    // }

    /**
     * @notice deploy a new strategy proxy
     * @param strategyAddress_ the address of the strategy
     * @return the address of the strategy proxy
     */
    // function _buildStrategyProxy(IStrategy strategyAddress_) internal returns (address) {
    //     address _strategyProxyAddress = strategyProxyFactory.build(strategyAddress_);

    //     _registryStrategyProxy(IStrategyProxy(_strategyProxyAddress));

    //     return _strategyProxyAddress;
    // }

    /**
     * @notice registry a strategy proxy
     * @param strategyProxyAddress_ the address of the strategy proxy
     */
    // function _registryStrategyProxy(IStrategyProxy strategyProxyAddress_) private {
    //     /// @dev requires a manual trust since strategy is not trusted yet
    //     _setStrategyProxyTrust(strategyProxyAddress_, false);
    // }

    /**
     * @notice set the status of the strategy proxy registry
     * @param strategyProxyAddress_ the address of the strategy proxy
     * @param isTrusted_ the status of the strategy proxy
     */
    // function _setStrategyProxyTrust(IStrategyProxy strategyProxyAddress_, bool isTrusted_) private {
    //     _strategyProxies[strategyProxyAddress_] = isTrusted_;
    // }
}
