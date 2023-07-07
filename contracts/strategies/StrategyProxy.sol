// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategyProxy} from '../interfaces/strategies/IStrategyProxy.sol';

contract StrategyProxy is IStrategyProxy {
    address public strategy;

    function deposit(bytes calldata _data) external {
        IStrategyProxy(strategy).deposit(_data);
    }

    function harvest() external {
        IStrategyProxy(strategy).harvest();
    }

    function setStrategy(address _strategy) external {
        strategy = _strategy;
    }
}
