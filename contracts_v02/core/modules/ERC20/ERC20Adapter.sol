// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BaseAdapter} from '../adapters/BaseAdapter.sol';

contract ERC20Adapter is BaseAdapter {
    using SafeERC20 for IERC20;

    constructor(address[] memory assetsIn_) {
        assetsIn = assetsIn_;
    }

    function _deposit(address depositor_, uint256[] memory amount_) internal {
        for (uint256 i = 0; i < assetsIn.length; i++) {
            IERC20(getAssetIn(i)).safeTransferFrom(depositor_, address(this), amount_[i]);
        }
    }

    // function withdraw(address requisitor_, uint256[] memory amounts_) public override virtual returns (uint256[] memory) {
    //     for (uint256 i = 0; i < assets.length; i++) {
    //         IERC20(assets[i]).safeTransfer(requisitor_, amounts_[i]);
    //     }

    //     return amounts_;
    // }

    // function safeApprove(address spender_, uint256[] memory amount_) public override virtual returns (uint256[] memory) {
    //     for (uint256 i = 0; i < assets.length; i++) {
    //         IERC20(assets[i]).safeApprove(spender_, amount_[i]);
    //     }

    //     return amount_;
    // }
}
