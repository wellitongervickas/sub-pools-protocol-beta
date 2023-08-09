// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {ERC20Adapter} from '../core/modules/ERC20/ERC20Adapter.sol';

contract FakeStrategy is IStrategy, ERC20Adapter {
    address[] private _assets;

    constructor(address[] memory assets_) {
        _assets = assets_;
    }

    function assets() public view override(IStrategy, ERC20Adapter) returns (address[] memory) {
        return _assets;
    }

    function deposit(address depositor_, uint256[] memory amount_) external returns (uint256[] memory) {
        return _deposit(depositor_, amount_);
    }

    function withdraw(address requisitor_, uint256[] memory amount_) external returns (uint256[] memory) {
        return _withdraw(requisitor_, amount_);
    }
}
