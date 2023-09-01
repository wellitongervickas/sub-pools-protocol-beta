// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Registry} from './Registry.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';

abstract contract BaseAdapter {
    using Address for address;

    Registry.Adapter public adapter;

    constructor(Registry.Adapter memory adapter_) {
        adapter = adapter_;
    }

    function deposit(
        uint256[] memory amounts_,
        address depositor_,
        address owner_,
        bytes memory adapterPayload_
    ) external virtual;

    function _callAdapterDeposit(bytes memory adapterPayload_) internal virtual {
        adapter.targetIn.functionCall(abi.encodePacked(adapter.depositFunction, adapterPayload_));
    }

    function withdraw(
        uint256[] memory amounts_,
        address receiver_,
        address owner_,
        bytes memory adapterPayload_
    ) external virtual;

    function _callAdapterWithdraw(bytes memory adapterPayload_) internal virtual {
        adapter.targetIn.functionCall(abi.encodePacked(adapter.withdrawFunction, adapterPayload_));
    }

    function harvest(address receiver_, address owner_, bytes memory adapterPayload_) external virtual;

    function _callAdapterHarvest(bytes memory adapterPayload_) internal virtual {
        adapter.targetIn.functionCall(abi.encodePacked(adapter.harvestFunction, adapterPayload_));
    }
}
