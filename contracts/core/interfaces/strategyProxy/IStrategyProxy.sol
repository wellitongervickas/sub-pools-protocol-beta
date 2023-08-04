// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../strategy/IStrategy.sol';

interface IStrategyProxy {
    /// @notice Returns the strategy that is being proxied
    function strategy() external view returns (IStrategy);
}
