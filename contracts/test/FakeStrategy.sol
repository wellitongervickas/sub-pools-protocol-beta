// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {StrategyERC20Adapter} from '../core/modules/ERC20/StrategyERC20Adapter.sol';

contract FakeStrategy is IStrategy, StrategyERC20Adapter, Ownable {
    bytes private _assets;

    constructor(bytes memory assets_) {
        _assets = assets_;
    }

    function assets() public view override(IStrategy, StrategyERC20Adapter) returns (bytes memory) {
        return _assets;
    }

    function deposit(address depositor_, bytes memory amount_) external onlyOwner returns (bytes memory) {
        return _deposit(depositor_, amount_);
    }

    function withdraw(address requisitor_, bytes memory amount_) external onlyOwner returns (bytes memory) {
        return _withdraw(requisitor_, amount_);
    }
}
