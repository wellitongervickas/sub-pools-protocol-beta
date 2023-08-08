// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {StrategyERC20Adapter} from '../core/modules/ERC20/StrategyERC20Adapter.sol';

contract FakeStrategy is IStrategy, StrategyERC20Adapter, Ownable {
    address[] private _assets;

    constructor(address[] memory assets_) {
        _assets = assets_;
    }

    function assets() public view override(IStrategy, StrategyERC20Adapter) returns (address[] memory) {
        return _assets;
    }

    function deposit(address depositor_, uint256[] memory amount_) external onlyOwner returns (uint256[] memory) {
        return _deposit(depositor_, amount_);
    }

    function withdraw(address requisitor_, uint256[] memory amount_) external onlyOwner returns (uint256[] memory) {
        return _withdraw(requisitor_, amount_);
    }
}
