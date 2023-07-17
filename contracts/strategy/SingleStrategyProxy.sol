// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {StrategyType} from '../interfaces/strategy/IStrategy.sol';

contract SingleStrategyProxy {
    StrategyType public immutable strategyType = StrategyType.Single;
    bytes[] public strategyData; //[address]

    constructor(bytes memory _strategyData) {
        strategyData.push(_strategyData);
    }

    function deposit(bytes memory _amount) public {}

    function _decodeStrategyData(bytes memory _strategyData) private pure returns (address) {
        return abi.decode(_strategyData, (address));
    }
}
