// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {BaseAdapter} from './BaseAdapter.sol';
import {FakePool} from './FakePool.sol';
import 'hardhat/console.sol';

contract FakePoolAdapter is BaseAdapter {
    using SafeERC20 for IERC20;

    IERC20[] private _assetsIn;

    constructor(address target_) {
        target = target_;
        _assetsIn = [FakePool(target).tokenA()];
    }

    function assetsIn() public view override returns (IERC20[] memory) {
        return _assetsIn;
    }

    function deposit(bytes memory data) public override {
        uint256[] memory amount = abi.decode(data, (uint256[]));

        _approveTarget(amount[0]);
        _openPosition(amount[0]);
    }

    function _approveTarget(uint256 amount_) private {
        assetsIn()[0].safeApprove(target, amount_);
    }

    function _openPosition(uint256 amount_) private {
        FakePool(target).openPosition(amount_);
    }
}
