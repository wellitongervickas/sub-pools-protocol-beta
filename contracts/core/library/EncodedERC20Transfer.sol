// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BytesLib} from './BytesLib.sol';

contract EncodedERC20Transfer {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    bytes public assets;

    constructor(address[] memory assets_) {
        assets = BytesLib.fromAddresses(assets_);
    }

    function _receiveAssets(address depositor_, bytes memory amount_) internal returns (bytes memory) {
        address[] memory assets_ = assets.toAddresses();
        uint256[] memory amounts = amount_.toAmounts();

        for (uint256 i = 0; i < assets_.length; i++) {
            IERC20(assets_[i]).safeTransferFrom(depositor_, address(this), amounts[i]);
        }

        return amount_;
    }

    function _sendAssets(address requisitor_, bytes memory amount_) internal returns (bytes memory) {
        address[] memory assets_ = assets.toAddresses();
        uint256[] memory amounts = amount_.toAmounts();

        for (uint256 i = 0; i < assets_.length; i++) {
            IERC20(assets_[i]).safeTransfer(requisitor_, amounts[i]);
        }

        return amount_;
    }
}
