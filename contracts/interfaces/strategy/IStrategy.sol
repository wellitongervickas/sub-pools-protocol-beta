// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {StrategyLib} from '../../libraries/Strategy.sol';

interface IStrategy {
    function strategyType() external view returns (StrategyLib.StrategyType);

    function tokenData() external view returns (bytes memory);
}
