// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {console} from 'hardhat/console.sol';
import {BaseAdapter} from '../core/modules/adapters/BaseAdapter.sol';

contract InvalidStrategy is BaseAdapter {
    error Revert(address depositor, uint256[] amount);

    function deposit(address depositor_, uint256[] memory amount_) public pure override {
        revert Revert(depositor_, amount_);
    }
}
