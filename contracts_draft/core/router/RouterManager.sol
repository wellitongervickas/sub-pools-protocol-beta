// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {Manager} from '../manager/Manager.sol';
import {INode} from '../interfaces/node/INode.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IBaseAdapter} from '../interfaces/adapters/IBaseAdapter.sol';

contract RouterManager is IRouterManager, Manager {
    INodeFactory public override nodeFactory;
    IVaultFactory public override vaultFactory;

    mapping(INode => bool) private _nodes;
    mapping(IBaseAdapter => bool) private _adapters;
    mapping(IBaseAdapter => IVault) private _vaults;

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
        INode node = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_);

        _registryNode(node);
        return address(node);
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

    function _buildVault(IBaseAdapter adapter_) internal returns (address) {
        IVault vault = vaultFactory.build(adapter_);

        _registryAdapter(adapter_);
        _registryVault(adapter_, vault);

        return address(vault);
    }

    function _registryAdapter(IBaseAdapter adapter_) private {
        _setAdapterTrust(adapter_, false);
    }

    function _setAdapterTrust(IBaseAdapter adapter_, bool isTrusted_) private {
        _adapters[adapter_] = isTrusted_;
    }

    function trustAdapter(IBaseAdapter adapter_, bool isTrusted_) external override onlyManager(address(this)) {
        _setAdapterTrust(adapter_, isTrusted_);
        emit IRouterManager.RouterManager_TrustAdapter(adapter_, isTrusted_);
    }

    function _registryVault(IBaseAdapter adapter_, IVault vault_) private {
        _vaults[adapter_] = vault_;
    }

    function vaults(IBaseAdapter adapter_) public view override returns (IVault) {
        return _vaults[adapter_];
    }

    function isAdapterTrusted(IBaseAdapter adapterAddress_) public view override returns (bool) {
        return _adapters[adapterAddress_];
    }
}
