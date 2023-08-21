// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {NodeFactory, Node} from './NodeFactory.sol';
import {VaultFactory, Vault} from './VaultFactory.sol';

contract Registry {
    NodeFactory public immutable nodeFactory;
    VaultFactory public immutable vaultFactory;

    event Registry_NodeCreated(address nodeAddress_);
    event Registry_VaultCreated(address vaultAddress_);

    constructor(NodeFactory nodeFactory_, VaultFactory vaultFactory_) {
        nodeFactory = nodeFactory_;
        vaultFactory = vaultFactory_;
    }

    function createNode(Vault[] memory vaultsIn_, Vault[] memory vaultsOut_) public returns (address nodeAddress) {
        nodeAddress = address(nodeFactory.createNode(vaultsIn_, vaultsOut_));

        emit Registry_NodeCreated(nodeAddress);
    }

    function createVault(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress) {
        vaultAddress = vaultFactory.createVault(asset_, name_, symbol_);

        emit Registry_VaultCreated(vaultAddress);
    }
}
