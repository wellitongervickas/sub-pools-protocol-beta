// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';
import {INode} from '../node/INode.sol';
import {IStrategyProxyFactory} from '../strategy/IStrategyProxyFactory.sol';

interface IRouterManager {
    /// @dev Emitted when the node factory is updated
    event RouterManager_NodeFactoryUpdated(address nodeFactoryAddress_);

    /// @dev Emmitted when the strategy proxy factory is updated
    event RouterManager_StrategyProxyFactoryUpdated(address strategyProxyFactory_);

    /// @notice the node factory
    function nodeFactory() external view returns (INodeFactory);

    /// @notice the strategy proxy factory
    function strategyProxyFactory() external view returns (IStrategyProxyFactory);

    /**
     * @notice update the node factory
     * @param nodeFactoryAddress_ address of the node factory
     * @dev only the manager can update the strategy proxy factory
     * @dev emits a {RouterManager_NodeFactoryUpdated} event
     */
    function updateNodeFactory(INodeFactory nodeFactoryAddress_) external;

    /**
     * @notice update the strategy proxy factory
     * @param strategyFactory_ address of the strategy proxy factory
     * @dev only the manager can update the strategy proxy factory
     * @dev emits a {RouterManager_StrategyProxyFactoryUpdated} event
     */
    function updateStrategyProxyFactory(IStrategyProxyFactory strategyFactory_) external;

    /**
     * @notice return true if the node is registered
     * @param nodeAddress_ the address of the node
     * @return true if the node is registered
     */
    function nodes(INode nodeAddress_) external view returns (bool);
}
