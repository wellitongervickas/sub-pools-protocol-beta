// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategyControl} from '../interfaces/strategy/IStrategyControl.sol';
import {StrategySingleProxy} from './StrategySingleProxy.sol';

contract StrategyControl is IStrategyControl {
    function createSingleStrategy(address _strategy) external returns (address) {
        return address(new StrategySingleProxy(_strategy));
    }
}
