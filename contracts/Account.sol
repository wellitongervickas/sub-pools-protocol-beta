// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {ERC20Adapter} from './ERC20Adapter.sol';
import {Registry} from './Registry.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';

contract Account is ERC20Adapter {
    Registry.Adapter public adapter;

    constructor(Registry.Adapter memory adapter_) {
        adapter = adapter_;
    }

    function deposit(uint256[] memory amount_, address depositor_, bytes memory adapterPayload_) external {
        _receiveTokensFromDepositor(adapter.tokensIn, depositor_, amount_);
        _approveTokensToSpender(adapter.tokensIn, adapter.targetIn, amount_);
        _callTargetInDeposit(adapterPayload_);
    }

    function _callTargetInDeposit(bytes memory adapterPayload_) private {
        Address.functionCall(adapter.targetIn, abi.encodePacked(adapter.depositFunction, adapterPayload_));
    }
}
