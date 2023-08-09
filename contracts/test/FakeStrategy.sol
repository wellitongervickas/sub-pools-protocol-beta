// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ERC20Adapter} from '../core/modules/ERC20/ERC20Adapter.sol';
import {BaseAdapter} from '../core/modules/adapters/BaseAdapter.sol';
import {console} from 'hardhat/console.sol';

contract FakeStrategy is BaseAdapter, ERC20Adapter {
    constructor(address[] memory assets_) {
        assets = assets_;
    }

    function deposit(address depositor_, uint256[] memory amount_) public override(BaseAdapter, ERC20Adapter) {
        return super.deposit(depositor_, amount_);
    }
}
