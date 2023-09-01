// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {ERC20Adapter} from './ERC20Adapter.sol';
import {PositionManager} from './PositionManager.sol';
import {Registry} from './Registry.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';

contract Account is ERC20Adapter, PositionManager {
    Registry.Adapter public adapter;

    constructor(Registry.Adapter memory adapter_) {
        adapter = adapter_;
    }

    event Account_Deposited(address indexed owner_, uint256[] amounts_);
    event Account_Withdrawn(address indexed owner_, uint256[] amounts_);
    event Account_Harvested(address indexed owner_, uint256[] amounts_);

    function deposit(
        uint256[] memory amounts_,
        address depositor_,
        address owner_,
        bytes memory adapterPayload_
    ) external {
        _deposit(amounts_, depositor_, adapterPayload_);
        _setPosition(amounts_, owner_);

        emit Account_Deposited(owner_, amounts_);
    }

    function _deposit(uint256[] memory amounts_, address depositor_, bytes memory adapterPayload_) internal {
        _receiveTokensFromDepositor(adapter.tokensIn, depositor_, amounts_);
        _approveTokensToSpender(adapter.tokensIn, adapter.targetIn, amounts_);
        _callTargetInDeposit(adapterPayload_);
    }

    function _callTargetInDeposit(bytes memory adapterPayload_) private {
        Address.functionCall(adapter.targetIn, abi.encodePacked(adapter.depositFunction, adapterPayload_));
    }

    function withdraw(
        uint256[] memory amounts_,
        address receiver_,
        address owner_,
        bytes memory adapterPayload_
    ) external {
        _decreasePositionAmount(amounts_, owner_);

        _withdraw(amounts_, receiver_, adapterPayload_);

        emit Account_Withdrawn(owner_, amounts_);
    }

    function _withdraw(uint256[] memory amounts_, address receiver_, bytes memory adapterPayload_) internal {
        _callTargetInWithdraw(adapterPayload_);
        _transferTokensToReceiver(adapter.tokensOut, receiver_, amounts_);
    }

    function _callTargetInWithdraw(bytes memory adapterPayload_) private {
        Address.functionCall(adapter.targetIn, abi.encodePacked(adapter.withdrawFunction, adapterPayload_));
    }

    function harvest(
        uint256[] memory amounts_,
        address receiver_,
        address owner_,
        bytes memory adapterPayload_
    ) external {
        _harvest(amounts_, receiver_, adapterPayload_);

        emit Account_Harvested(owner_, amounts_);
    }

    function _harvest(uint256[] memory amounts_, address receiver_, bytes memory adapterPayload_) internal {
        _callTargetInHarvest(adapterPayload_);
        _transferTokensToReceiver(adapter.tokensReward, receiver_, amounts_);
    }

    function _callTargetInHarvest(bytes memory adapterPayload_) private {
        Address.functionCall(adapter.targetIn, abi.encodePacked(adapter.harvestFunction, adapterPayload_));
    }
}
