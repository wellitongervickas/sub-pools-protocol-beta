// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import 'hardhat/console.sol';

contract FakePool {
    using SafeERC20 for IERC20;
    IERC20 public tokenA;

    bool isDepositedSuccess;

    event Deposit(uint256 amount_, address depositor_);

    constructor(IERC20 tokenA_) {
        tokenA = tokenA_;
    }

    function openPosition(uint256 amount_, bool isDepositedSuccess_) public {
        isDepositedSuccess = isDepositedSuccess_;
        tokenA.safeTransferFrom(msg.sender, address(this), amount_);

        emit Deposit(amount_, msg.sender);
    }
}
