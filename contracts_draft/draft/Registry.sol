// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';
import {BaseAdapter} from './BaseAdapter.sol';
import {Vault} from '../Vault.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Node} from './Node.sol';

contract Registry {
    using Counters for Counters.Counter;
    Counters.Counter private _currentAdapterId;

    mapping(bytes32 => address) public adapters;
    mapping(IERC20 => Vault) public assets;

    event Registry_AdapterCreated(bytes32 id_);
    event Registry_VaultCreated(address vaultAddress_);
    event Registry_NodeCreated(address nodeAddress_);

    function createAdapter(address target_) public returns (bytes32 id) {
        id = _createAdapter(target_);

        emit Registry_AdapterCreated(id);

        adapters[id] = target_;
    }

    function _createAdapter(address target_) public returns (bytes32 id) {
        id = keccak256(abi.encodePacked(target_, _currentAdapterId.current()));
        _currentAdapterId.increment();
    }

    function getAdapter(bytes32 id_) public view returns (address) {
        return adapters[id_];
    }

    function createVault(IERC20 asset_, string memory name_, string memory symbol_) public returns (Vault vault) {
        vault = _createVault(asset_, name_, symbol_);

        emit Registry_VaultCreated(address(vault));

        assets[asset_] = vault;
    }

    function _createVault(IERC20 asset_, string memory name_, string memory symbol_) public returns (Vault vault) {
        vault = new Vault(asset_, name_, symbol_);
    }

    function getVault(IERC20 asset_) public view returns (Vault) {
        return assets[asset_];
    }

    function createNode(address adapter_) public returns (address nodeAddress) {
        nodeAddress = address(new Node(adapter_, this));
        emit Registry_NodeCreated(nodeAddress);
    }
}
