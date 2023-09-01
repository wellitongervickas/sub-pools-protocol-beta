// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BaseAdapter} from './BaseAdapter.sol';

abstract contract ERC20Adapter is BaseAdapter {
    using SafeERC20 for IERC20;

    constructor(bytes memory assetsIn_, bytes memory assetsOut_) BaseAdapter(assetsIn_, assetsOut_) {}

    function deposit(address receiver_, bytes memory assets_) public virtual override returns (bytes memory) {
        return _deposit(receiver_, assets_);
    }

    function withdraw(address receiver_, bytes memory assets_) public virtual override returns (bytes memory) {
        return _withdraw(receiver_, assets_);
    }

    function _deposit(address receiver_, bytes memory amount_) internal virtual returns (bytes memory) {
        address[] memory assetsIn_ = abi.decode(getAssetsIn(), (address[]));
        uint256[] memory amount = abi.decode(amount_, (uint256[]));

        for (uint256 i = 0; i < assetsIn_.length; i++) {
            IERC20(assetsIn_[i]).safeTransferFrom(receiver_, address(this), amount[i]);
        }

        return amount_;
    }

    function _withdraw(address receiver_, bytes memory amount_) internal virtual returns (bytes memory) {
        address[] memory assetsOut_ = abi.decode(getAssetsOut(), (address[]));
        uint256[] memory amount = abi.decode(amount_, (uint256[]));

        for (uint256 i = 0; i < assetsOut_.length; i++) {
            IERC20(assetsOut_[i]).safeTransfer(receiver_, amount[i]);
        }

        return amount_;
    }
}
