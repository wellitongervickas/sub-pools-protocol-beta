// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {BaseAdapter} from './BaseAdapter.sol';
import {FakePool} from './FakePool.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import 'hardhat/console.sol';

contract GenericAdapter is BaseAdapter {
    using SafeERC20 for IERC20;
    using Address for address;
    bytes4 private immutable _functionSelector;

    constructor(address target_, IERC20[] memory assetsIn_, bytes4 functionSelector_) {
        target = target_;
        _assetsIn = assetsIn_;
        _functionSelector = functionSelector_;
    }

    function deposit(bytes memory data) public override {
        address(target).functionCall(abi.encodePacked(_functionSelector, data));
    }
}
