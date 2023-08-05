// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';
import {INode} from '../node/INode.sol';
import {IVaultFactory} from '../vault/IVaultFactory.sol';
import {IVault} from '../vault/IVault.sol';
import {IStrategy} from '../strategy/IStrategy.sol';

interface IRouterManager {
    event RouterManager_NodeFactoryUpdated(address nodeFactoryAddress_);
    event RouterManager_VaultFactoryUpdated(address vaultFactoryAddress_);
    event RouterManager_NodeTrust(INode node_, bool status_);
    event RouterManager_StrategyTrust(IStrategy strategy_, bool status_);

    function nodeFactory() external view returns (INodeFactory);

    function updateNodeFactory(INodeFactory nodeFactoryAddress_) external;

    function nodes(INode nodeAddress_) external view returns (bool);

    function vaultFactory() external view returns (IVaultFactory);

    function updateVaultFactory(IVaultFactory vaultFactoryAddress_) external;

    // function trustStrategy(IStrategy strategy_, bool status_) external;

    // function strategies(IStrategy strategyAddress_) external view returns (bool);
    //
    // function vaults(IStrategy strategy_) external view returns (IVault);
}
