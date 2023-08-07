// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {EncodedERC20Transfer} from '../library/EncodedERC20Transfer.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract VaultAdapter is EncodedERC20Transfer {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    function assets() public view override(EncodedERC20Transfer) returns (bytes memory) {
        return strategy.assets();
    }

    function _deposit(address depositor_, bytes memory amount_) internal override returns (bytes memory) {
        super._deposit(depositor_, amount_);

        _safeApprove(address(strategy), amount_);

        return strategy.deposit(address(this), amount_);
    }
}
