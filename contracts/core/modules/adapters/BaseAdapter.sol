// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IBaseAdapter} from '../../interfaces/adapters/IBaseAdapter.sol';

abstract contract BaseAdapter {
    address[] public assets;

    function getAssets() public view virtual returns (address[] memory) {
        return assets;
    }

    function deposit(address depositor_, uint256[] memory amount_) public virtual {}
}
