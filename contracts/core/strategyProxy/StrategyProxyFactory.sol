// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategyProxyFactory} from '../interfaces/strategyProxy/IStrategyProxyFactory.sol';
import {StrategyProxy} from './StrategyProxy.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

/// ToDO: only deployer can build
contract StrategyProxyFactory is IStrategyProxyFactory {
    function build(IStrategy strategy_) public returns (address) {
        StrategyProxy strategyProxy = new StrategyProxy(strategy_);

        emit IStrategyProxyFactory.StrategyProxyFactory_StrategyProxyCreated(
            address(strategyProxy),
            address(strategy_)
        );

        return address(strategyProxy);
    }
}
