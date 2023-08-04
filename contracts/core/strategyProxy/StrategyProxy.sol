// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract StrategyProxy {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = IStrategy(strategy_);
    }
}
