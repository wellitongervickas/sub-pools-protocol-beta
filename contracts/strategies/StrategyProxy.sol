// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategies/IStrategy.sol';

/**
 * @title StrategyProxy
 * @notice
 * The proxy to handle simple strategies. This contract will
 * deletage the calls to the strategy contract that has been set.
 */

contract StrategyProxy is IStrategy {
    address public strategy;

    function setup(bytes calldata _setup) external {
        IStrategy(strategy).setup(_setup);
    }

    function deposit(uint256 _amount) external {
        IStrategy(strategy).deposit(_amount);
    }

    function harvest() external {
        IStrategy(strategy).harvest();
    }

    // todo: change to constructor
    function setStrategy(address _strategy) external {
        strategy = _strategy;
    }
}
