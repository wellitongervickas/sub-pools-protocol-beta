// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BytesLib} from '../../library/BytesLib.sol';
import {IStrategy} from '../../interfaces/strategy/IStrategy.sol';

abstract contract StrategyERC20Adapter {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    function assets() public view virtual returns (bytes memory) {}

    function _deposit(address depositor_, bytes memory amount_) internal virtual returns (bytes memory) {
        uint256[] memory amounts = amount_._toAmounts();
        address[] memory addressess = assets()._toAddresses();

        for (uint256 i = 0; i < addressess.length; i++) {
            IERC20(addressess[i]).safeTransferFrom(depositor_, address(this), amounts[i]);
        }

        return amount_;
    }

    function _withdraw(address requisitor_, bytes memory amount_) internal virtual returns (bytes memory) {
        uint256[] memory amounts = amount_._toAmounts();
        address[] memory addressess = assets()._toAddresses();

        for (uint256 i = 0; i < addressess.length; i++) {
            IERC20(addressess[i]).safeTransfer(requisitor_, amounts[i]);
        }

        return amount_;
    }

    function _safeApprove(address spender_, bytes memory amount_) public virtual returns (bytes memory) {
        uint256[] memory amounts = amount_._toAmounts();
        address[] memory addressess = assets()._toAddresses();

        for (uint256 i = 0; i < addressess.length; i++) {
            IERC20(addressess[i]).safeApprove(spender_, amounts[i]);
        }

        return amount_;
    }
}
