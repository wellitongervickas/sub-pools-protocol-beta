// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IBaseAdapter} from '../interfaces/adapters/IBaseAdapter.sol';
import {ERC20Adapter} from '../modules/ERC20/ERC20Adapter.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BaseAdapter} from '../modules/adapters/BaseAdapter.sol';
import {console} from 'hardhat/console.sol';

contract VaultAdapter is BaseAdapter {
    IBaseAdapter public immutable adapter;

    constructor(IBaseAdapter adapter_) {
        adapter = adapter_;
        assets = adapter_.getAssets();
    }

    function deposit(address depositor_, uint256[] memory amount_) public virtual override {
        (bool success, ) = address(adapter).delegatecall(
            abi.encodeWithSelector(IBaseAdapter.deposit.selector, depositor_, amount_)
        );

        console.log(success);
    }
}
