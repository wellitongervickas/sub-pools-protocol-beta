// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract StrategySingleProxy is IStrategy {
    address public immutable strategy;

    constructor(address _strategy) {
        strategy = _strategy;
    }

    function setup(bytes calldata _setup) external {
        IStrategy(strategy).setup(_setup);
    }

    function deposit(uint256 _amount) external {
        IStrategy(strategy).deposit(_amount);
    }

    function harvest() external {
        IStrategy(strategy).harvest();
    }

    function withdraw(uint256 _amount) external {
        IStrategy(strategy).withdraw(_amount);
    }
}
