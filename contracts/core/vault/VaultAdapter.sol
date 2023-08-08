// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {ERC20Adapter} from '../modules/ERC20/ERC20Adapter.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract VaultAdapter is ERC20Adapter {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    function assets() public view override returns (address[] memory) {
        return strategy.assets();
    }

    function _deposit(address depositor_, uint256[] memory amount_) internal override returns (uint256[] memory) {
        super._deposit(depositor_, amount_);

        _safeApprove(address(strategy), amount_);

        return strategy.deposit(address(this), amount_);
    }

    function _withdraw(address requisitor_, uint256[] memory amount_) internal override returns (uint256[] memory) {
        super._withdraw(requisitor_, amount_);

        return strategy.withdraw(requisitor_, amount_);
    }
}
