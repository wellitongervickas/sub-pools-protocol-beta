// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Vault} from './Vault.sol';
import {Node} from './Node.sol';

contract NodeFactory {
    event NodeFactory_Created(address nodeAddress_);

    function createNode(Vault[] memory vaultsIn_, Vault[] memory vaultsOut_) public returns (address nodeAddress) {
        nodeAddress = address(new Node(vaultsIn_, vaultsOut_));
        emit NodeFactory_Created(nodeAddress);
    }
}
