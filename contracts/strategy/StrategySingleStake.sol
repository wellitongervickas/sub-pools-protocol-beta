// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from './interfaces/IStrategy.sol';

contract StrategySingleProxy is IStrategy {
    function setup(bytes calldata _setup) external {
        // do something
    }

    function deposit(uint256 _amount) external {
        // do something
    }

    function harvest() external {
        // do something
    }

    function withdraw(uint256 _amount) external {
        // do something
    }
}
