// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {Mode} from '../libraries/Coder.sol';

contract FakeStrategySingle is IStrategy {
    bytes public token;
    Mode public immutable mode = Mode.Single;

    constructor(bytes memory _token) {
        token = _token;
    }

    function deposit(bytes memory _amount) public {}
}
