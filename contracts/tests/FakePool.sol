// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract FakePool {
    using SafeERC20 for IERC20;
    IERC20 public tokenA;
    IERC20 public tokenB;
    IERC20 public tokenOut;

    constructor(IERC20 tokenA_, IERC20 tokenB_, IERC20 tokenOut_) {
        tokenA = tokenA_;
        tokenB = tokenB_;
        tokenOut = tokenOut_;
    }

    function supply(uint256 amountA_, uint256 amountB_) external {
        _receiveSupplyTokens(amountA_, amountB_);
    }

    function _receiveSupplyTokens(uint256 amountA_, uint256 amountB_) private {
        tokenA.safeTransferFrom(msg.sender, address(this), amountA_);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB_);
    }

    function tokenBalance() external view returns (uint256, uint256) {
        return (_tokenABalance(), _tokenBBalance());
    }

    function _tokenABalance() private view returns (uint256) {
        return tokenA.balanceOf(address(this));
    }

    function _tokenBBalance() private view returns (uint256) {
        return tokenB.balanceOf(address(this));
    }

    function depositRewards(uint256 amount_) external {
        _receiveRewardsToken(amount_);
    }

    function _receiveRewardsToken(uint256 amount_) private {
        tokenOut.safeTransferFrom(msg.sender, address(this), amount_);
    }

    function harvest(uint256 amount_) external {
        _harvestRewardsToken(amount_);
    }

    function rewardsBalance() external view returns (uint256) {
        return _tokenOutBalance();
    }

    function _tokenOutBalance() private view returns (uint256) {
        return tokenOut.balanceOf(address(this));
    }

    function _harvestRewardsToken(uint256 amount_) private {
        tokenOut.safeTransfer(msg.sender, amount_);
    }

    function withdraw(uint256 amountA_, uint256 amountB_) external {
        _sendSupplyTokens(amountA_, amountB_);
    }

    function _sendSupplyTokens(uint256 amountA_, uint256 amountB_) private {
        tokenA.safeTransfer(msg.sender, amountA_);
        tokenB.safeTransfer(msg.sender, amountB_);
    }
}
