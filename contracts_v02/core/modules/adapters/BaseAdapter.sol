// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IBaseAdapter} from '../../interfaces/adapters/IBaseAdapter.sol';

abstract contract BaseAdapter {
    address[] public assetsIn;

    function getAssetsIn() public view virtual returns (address[] memory) {
        return assetsIn;
    }

    function getAssetIn(uint256 index_) public view virtual returns (address) {
        return assetsIn[index_];
    }

    function deposit(address depositor_, uint256[] memory amount_) public virtual {}
}
