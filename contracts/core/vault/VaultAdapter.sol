// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {StrategyERC20Adapter} from '../modules/ERC20/StrategyERC20Adapter.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract VaultAdapter is IStrategy, StrategyERC20Adapter {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    function assets() public view override(IStrategy, StrategyERC20Adapter) returns (bytes memory) {
        return strategy.assets();
    }

    function deposit(address depositor_, bytes memory amount_) public override returns (bytes memory) {
        super._deposit(depositor_, amount_);

        _safeApprove(address(strategy), amount_);

        return strategy.deposit(address(this), amount_);
    }

    function withdraw(address requisitor_, bytes memory amount_) public override returns (bytes memory) {
        super._withdraw(requisitor_, amount_);
        return strategy.withdraw(requisitor_, amount_);
    }
}
