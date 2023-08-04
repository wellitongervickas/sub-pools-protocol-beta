// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../strategy/IStrategy.sol';

interface IStrategyProxy {
    function strategy() external view returns (IStrategy);
}
