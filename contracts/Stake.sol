// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import 'hardhat/console.sol';

contract Stake {
    using SafeERC20 for IERC20;
    IERC20[] public tokens;

    IERC20 public tokenOutput;

    event Deposit(uint256[] amount_, address depositor_);
    event Withdraw(uint256[] amount_, address withdrawer_);
    event Harvest(address harvester_);

    constructor(IERC20[] memory tokens_, IERC20 tokenOutput_) {
        tokens = tokens_;
        tokenOutput = tokenOutput_;
    }

    function deposit(uint256[] memory amount_) public {
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].safeTransferFrom(msg.sender, address(this), amount_[i]);
        }

        emit Deposit(amount_, msg.sender);
    }

    function withdraw(uint256[] memory amount_) public {
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].safeTransfer(msg.sender, amount_[i]);
        }

        emit Withdraw(amount_, msg.sender);
    }

    function harvest() public {
        tokenOutput.safeTransfer(msg.sender, tokenOutput.balanceOf(address(this)));

        emit Harvest(msg.sender);
    }
}
