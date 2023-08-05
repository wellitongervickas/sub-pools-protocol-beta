// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';
import {INode} from '../node/INode.sol';
import {IVaultFactory} from '../vault/IVaultFactory.sol';

interface IRouterManager {
    event RouterManager_NodeFactoryUpdated(address nodeFactoryAddress_);
    event RouterManager_VaultFactoryUpdated(address vaultFactoryAddress_);

    event RouterManager_NodeTrust(INode node_, bool status_);

    function nodeFactory() external view returns (INodeFactory);

    function vaultFactory() external view returns (IVaultFactory);

    function updateNodeFactory(INodeFactory nodeFactoryAddress_) external;

    function updateVaultFactory(IVaultFactory vaultFactoryAddress_) external;

    function trustNode(INode node_, bool status_) external;

    function nodes(INode nodeAddress_) external view returns (bool);
}
