// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IStrategyProxy} from '../interfaces/strategyProxy/IStrategyProxy.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract StrategyProxy is IStrategyProxy, Ownable {
    ///@inheritdoc IStrategyProxy
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = IStrategy(strategy_);
    }
}
