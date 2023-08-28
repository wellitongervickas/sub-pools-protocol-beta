// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Node} from './Node.sol';
import {Vault} from './Vault.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Router {
    using SafeERC20 for Vault;

    event Router_AdapterCreated(bytes32 id);
    event Router_PositionOpened(address nodeAddress, bytes32 adapterId);

    struct Adapter {
        address targetAddress;
        Vault[] vaultsIn;
        bytes4 functionSelector;
    }

    mapping(bytes32 => Adapter) public adapters;

    function createAdapter(
        address targetAddress,
        Vault[] memory assetsIn,
        bytes4 functionSelector_
    ) external returns (bytes32 id) {
        id = keccak256(abi.encodePacked(targetAddress, '0'));

        adapters[id] = Adapter(targetAddress, assetsIn, functionSelector_);

        emit Router_AdapterCreated(id);
    }

    function openPosition(
        bytes32 adapterId,
        uint256[] memory amount,
        bytes memory data
    ) external returns (address nodeAddress) {
        Adapter memory adapter = adapters[adapterId];

        Node node = new Node(adapter);

        nodeAddress = address(node);

        Vault[] memory vaultsIn = adapter.vaultsIn;

        for (uint256 i = 0; i < vaultsIn.length; i++) {
            Vault vault = vaultsIn[i];
            vault.safeTransferFrom(msg.sender, nodeAddress, amount[i]);
        }

        node.deposit(amount, data);

        emit Router_PositionOpened(nodeAddress, adapterId);
    }
}
