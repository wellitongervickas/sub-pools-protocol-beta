// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {NodeFactory} from './NodeFactory.sol';
import {Vault} from './Vault.sol';
import {VaultFactory} from './VaultFactory.sol';

contract Router {
    NodeFactory public nodeFactory;
    VaultFactory public vaultFactory;

    event Router_NodeCreated(address nodeAddress_);
    event Router_VaultCreated(address vaultAddress_);

    constructor(NodeFactory nodeFactory_, VaultFactory vaultFactory_) {
        nodeFactory = nodeFactory_;
        vaultFactory = vaultFactory_;
    }

    function createNode(Vault[] memory vaultsIn_, Vault[] memory vaultsOut_) public returns (address nodeAddress) {
        nodeAddress = nodeFactory.createNode(vaultsIn_, vaultsOut_);
        emit Router_NodeCreated(nodeAddress);
    }

    function createVault(
        IERC20 token_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress) {
        vaultAddress = vaultFactory.createVault(token_, name_, symbol_);
        emit Router_VaultCreated(vaultAddress);
    }
}
