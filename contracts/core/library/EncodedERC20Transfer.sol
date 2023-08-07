// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BytesLib} from './BytesLib.sol';

abstract contract EncodedERC20Transfer {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    function assets() public view virtual returns (bytes memory) {}

    function _deposit(address depositor_, bytes memory amount_) internal virtual returns (bytes memory) {
        (address[] memory assets_, uint256[] memory amounts) = _decodeAssetsData(amount_);

        for (uint256 i = 0; i < assets_.length; i++) {
            IERC20(assets_[i]).safeTransferFrom(depositor_, address(this), amounts[i]);
        }

        return amount_;
    }

    function _withdraw(address requisitor_, bytes memory amount_) internal virtual returns (bytes memory) {
        (address[] memory assets_, uint256[] memory amounts) = _decodeAssetsData(amount_);

        for (uint256 i = 0; i < assets_.length; i++) {
            IERC20(assets_[i]).safeTransfer(requisitor_, amounts[i]);
        }

        return amount_;
    }

    function _safeApproveAssetsTransfer(
        address requisitor_,
        bytes memory amount_
    ) internal virtual returns (bytes memory) {
        (address[] memory assets_, uint256[] memory amounts) = _decodeAssetsData(amount_);

        for (uint256 i = 0; i < assets_.length; i++) {
            IERC20(assets_[i]).safeApprove(requisitor_, amounts[i]);
        }

        return amount_;
    }

    function _decodeAssetsData(bytes memory amount_) private view returns (address[] memory, uint256[] memory) {
        return (BytesLib._toAddresses(assets()), amount_._toAmounts());
    }
}
