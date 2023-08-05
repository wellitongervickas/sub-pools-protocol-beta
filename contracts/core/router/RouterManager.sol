// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {Manager} from '../manager/Manager.sol';
import {INode} from '../interfaces/node/INode.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract RouterManager is IRouterManager, Manager {
    INodeFactory public override nodeFactory;
    IVaultFactory public override vaultFactory;

    mapping(INode => bool) private _nodes;
    mapping(IStrategy => bool) private _strategies;
    mapping(IStrategy => IVault) private _vaults;

    constructor(INodeFactory nodeFactory_, IVaultFactory vaultFactory_) Manager(msg.sender) {
        _updateNodeFactory(nodeFactory_);
        _updateVaultFactory(vaultFactory_);
    }

    function _updateNodeFactory(INodeFactory nodeFactory_) private {
        nodeFactory = nodeFactory_;
    }

    function _updateVaultFactory(IVaultFactory vaultFactory_) private {
        vaultFactory = vaultFactory_;
    }

    function updateNodeFactory(INodeFactory nodeFactory_) external override onlyManager(address(this)) {
        _updateNodeFactory(nodeFactory_);
        emit IRouterManager.RouterManager_NodeFactoryUpdated(address(nodeFactory_));
    }

    function updateVaultFactory(IVaultFactory vaultFactory_) external override onlyManager(address(this)) {
        _updateVaultFactory(vaultFactory_);
        emit IRouterManager.RouterManager_VaultFactoryUpdated(address(vaultFactory_));
    }

    function _buildNode(address[] memory invitedAddresses_, address parentAddress_) internal returns (address) {
        address nodeAddress = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_);

        _registryNode(INode(nodeAddress));
        return nodeAddress;
    }

    function _registryNode(INode node_) private {
        _setNodeTrust(node_, true);
    }

    function _setNodeTrust(INode node_, bool isTrusted_) private {
        _nodes[node_] = isTrusted_;
    }

    function nodes(INode node_) public view override returns (bool) {
        return _nodes[node_];
    }

    function _buildVault(IStrategy strategy_) internal returns (address) {
        address vaultAddress = vaultFactory.build(strategy_);

        _registryStrategy(strategy_);
        _registryVault(strategy_, IVault(vaultAddress));

        return vaultAddress;
    }

    function _registryStrategy(IStrategy strategy_) private {
        _setStrategyTrust(strategy_, false);
    }

    function _setStrategyTrust(IStrategy strategy_, bool isTrusted_) private {
        _strategies[strategy_] = isTrusted_;
    }

    function trustStrategy(IStrategy strategy_, bool isTrusted_) external override onlyManager(address(this)) {
        _setStrategyTrust(strategy_, isTrusted_);
        emit IRouterManager.RouterManager_StrategyTrust(strategy_, isTrusted_);
    }

    function strategies(IStrategy strategy_) public view override returns (bool) {
        return _strategies[IStrategy(strategy_)];
    }

    function _registryVault(IStrategy strategy_, IVault vault_) private {
        _setVaultTrust(strategy_, vault_);
    }

    function _setVaultTrust(IStrategy strategy_, IVault vault_) private {
        _vaults[strategy_] = vault_;
    }

    function vaults(IStrategy strategy_) public view override returns (IVault) {
        return _vaults[strategy_];
    }
}
