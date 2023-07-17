// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy, StrategyType} from '../interfaces/strategy/IStrategy.sol';

contract FakeStrategySingle is IStrategy {
    bytes public token;
    StrategyType public immutable strategyType = StrategyType.Single;

    constructor(bytes memory _token) {
        token = _token;
    }

    function deposit(bytes memory _amount) public {}
}
