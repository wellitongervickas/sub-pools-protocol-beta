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
        Vault[] vaultsOut;
        Vault[] vaultsProfit;
        bytes4 depositFunctionSignature;
        bytes4 withdrawFunctionSignature;
        bytes4 harvestFunctionSignature;
    }

    mapping(bytes32 => Adapter) public adapters;

    event Router_AdapterCreated(bytes32 id_);
    event Router_PositionOpened(Node nodeAddress_, bytes32 adapterId_);
    event Router_PositionIncreased(Node nodeAddress_, uint256[] amount_);
    event Router_PositionDecreased(Node nodeAddress_, uint256[] amount_);
    event Router_PositionHarvested(Node nodeAddress_);

    function createAdapter(
        address targetAddress,
        Vault[] memory vaultsIn,
        Vault[] memory vaultsOut,
        Vault[] memory vaultsProfit,
        bytes4 depositFunctionSignature_,
        bytes4 withdrawFunctionSignature_,
        bytes4 harvestFunctionSignature_
    ) external returns (bytes32 id) {
        id = keccak256(abi.encodePacked(targetAddress, _currentAdapterId.current()));

        adapters[id] = Adapter(
            targetAddress,
            vaultsIn,
            vaultsOut,
            vaultsProfit,
            depositFunctionSignature_,
            withdrawFunctionSignature_,
            harvestFunctionSignature_
        );

        emit Router_AdapterCreated(id);

        _currentAdapterId.increment();
    }

    function openPosition(
        bytes32 adapterId,
        uint256[] memory amount_,
        bytes memory data_
    ) external returns (Node node) {
        Adapter memory adapter = adapters[adapterId];
        node = new Node(adapter);

        _transferAssetsToNode(node, amount_);

        node.deposit(amount_, msg.sender, data_);

        emit Router_PositionOpened(node, adapterId);
    }

    function _transferAssetsToNode(Node node, uint256[] memory amount_) private {
        Adapter memory adapter = node.getAdapter();

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];
            vault.safeTransferFrom(msg.sender, address(node), amount_[i]);
        }
    }

    function increasePosition(Node node_, uint256[] memory amount_, bytes memory data_) external {
        _transferAssetsToNode(node_, amount_);

        node_.deposit(amount_, msg.sender, data_);

        emit Router_PositionIncreased(node_, amount_);
    }

    function decreasePosition(Node node_, uint256[] memory amount_, bytes memory data_) external {
        node_.withdraw(amount_, msg.sender, data_);

        emit Router_PositionDecreased(node_, amount_);
    }

    function harvest(Node node_) external {
        node_.harvest(msg.sender);

        emit Router_PositionHarvested(node_);
    }
}
