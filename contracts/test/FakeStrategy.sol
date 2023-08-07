// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {EncodedERC20Transfer} from '../core/library/EncodedERC20Transfer.sol';

contract FakeStrategy is IStrategy, EncodedERC20Transfer {
    bytes private _assets;

    constructor(bytes memory assets_) {
        _assets = assets_;
    }

    function assets() public view override(EncodedERC20Transfer, IStrategy) returns (bytes memory) {
        return _assets;
    }

    function deposit(address depositor_, bytes memory amount_) external returns (bytes memory) {
        return _deposit(depositor_, amount_);
    }

    function withdraw(address requisitor_, bytes memory amount_) external returns (bytes memory) {
        return _withdraw(requisitor_, amount_);
    }
}
