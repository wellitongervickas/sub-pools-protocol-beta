// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Node} from './Node.sol';
import {Vault} from './Vault.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';

contract Router {
    using SafeERC20 for Vault;
    using Counters for Counters.Counter;

    Counters.Counter private _currentAdapterId;

    struct Adapter {
        address targetAddress;
        Vault[] vaultsIn;
        bytes4 functionSelector;
    }

    mapping(bytes32 => Adapter) public adapters;

    event Router_AdapterCreated(bytes32 id_);
    event Router_PositionOpened(address nodeAddress_, bytes32 adapterId_);
    event Router_PositionIncreased(address nodeAddress_, uint256[] amount_);

    function createAdapter(
        address targetAddress,
        Vault[] memory assetsIn,
        bytes4 functionSelector_
    ) external returns (bytes32 id) {
        id = keccak256(abi.encodePacked(targetAddress, _currentAdapterId.current()));

        adapters[id] = Adapter(targetAddress, assetsIn, functionSelector_);

        emit Router_AdapterCreated(id);

        _currentAdapterId.increment();
    }

    function openPosition(
        bytes32 adapterId,
        uint256[] memory amount,
        bytes memory data
    ) external returns (address nodeAddress) {
        Adapter memory adapter = adapters[adapterId];
        Node node = new Node(adapter);
        nodeAddress = address(node);

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];
            vault.safeTransferFrom(msg.sender, nodeAddress, amount[i]);
        }

        node.openPosition(amount, msg.sender, data);

        emit Router_PositionOpened(nodeAddress, adapterId);
    }

    function increasePosition(address nodeAddress, uint256[] memory amount, bytes memory data) external {
        Node node = Node(nodeAddress);
        Adapter memory adapter = node.getAdapter();

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];
            vault.safeTransferFrom(msg.sender, nodeAddress, amount[i]);
        }

        node.increasePosition(amount, msg.sender, data);

        emit Router_PositionIncreased(nodeAddress, amount);
    }
}
