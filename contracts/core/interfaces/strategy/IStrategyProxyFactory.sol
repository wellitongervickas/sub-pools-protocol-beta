// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../strategy/IStrategy.sol';

interface IStrategyProxyFactory {
    /// @dev Emmits when a strategy proxy is created
    event StrategyProxyFactory_StrategyProxyCreated(address strategyProxy_, address strategy_);

    /**
     * @notice deploy a new strategy proxy
     * @param strategy_ the strategy to be proxied
     * @return the address of the strategy proxy
     * @dev emits a {StrategyProxyFactory_StrategyProxyCreated} event
     */
    function build(IStrategy strategy_) external returns (address);
}
