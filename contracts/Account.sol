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

    function deposit(uint256[] memory amounts_, address owner_, bytes memory adapterPayload_) external {
        _receiveTokensFromDepositor(adapter.tokensIn, msg.sender, amounts_);
        _approveTokensToSpender(adapter.tokensIn, adapter.targetIn, amounts_);
        _callTargetInDeposit(adapterPayload_);

        _setPosition(amounts_, owner_);

        emit Account_Deposited(owner_, amounts_);
    }

    function _callTargetInDeposit(bytes memory adapterPayload_) private {
        Address.functionCall(adapter.targetIn, abi.encodePacked(adapter.depositFunction, adapterPayload_));
    }
}
