// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {NodeFactory, Node} from './NodeFactory.sol';
import {VaultFactory, Vault} from './VaultFactory.sol';

contract Registry {
    NodeFactory public immutable nodeFactory;
    VaultFactory public immutable vaultFactory;

    mapping(address => bool) public nodes;
    mapping(address => bool) public vaults;

    event Registry_NodeCreated(address nodeAddress_);
    event Registry_VaultCreated(address vaultAddress_);

    constructor(NodeFactory nodeFactory_, VaultFactory vaultFactory_) {
        nodeFactory = nodeFactory_;
        vaultFactory = vaultFactory_;
    }

    function createNode(Vault[] memory vaultsIn_, Vault[] memory vaultsOut_) public returns (address nodeAddress) {
        nodeAddress = nodeFactory.createNode(vaultsIn_, vaultsOut_);

        emit Registry_NodeCreated(nodeAddress);

        nodes[nodeAddress] = true;
    }

    function createVault(
        IERC20 token_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress) {
        vaultAddress = vaultFactory.createVault(token_, name_, symbol_);

        emit Registry_VaultCreated(vaultAddress);

        vaults[vaultAddress] = true;
    }
}
