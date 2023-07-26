// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {IRegistryPivot} from '../interfaces/registry/IRegistryPivot.sol';
import {Mode} from '../libraries/Bytes.sol';

contract RegistryPivot is IRegistryPivot {
    IStrategy public immutable strategy;

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);
    }

    function strategyMode() public view returns (Mode) {
        return strategy.mode();
    }

    function _deposit(address _depositor, bytes memory _amount) internal {
        strategy.deposit(_depositor, _amount);
    }

    function _withdraw(address _requisitor, bytes memory _amount) internal {
        strategy.withdraw(_requisitor, _amount);
    }
}
