// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract VaultAdapter {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    function _deposit(address depositor_, bytes memory amount_) internal returns (bytes memory) {
        return strategy.deposit(depositor_, amount_);
    }
}
