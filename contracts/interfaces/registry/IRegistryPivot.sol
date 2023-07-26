// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Mode} from '../../libraries/Bytes.sol';

interface IRegistryPivot {
    event Deposited(address indexed _depositor, bytes _amount);
    event Withdrew(address indexed _requisitor, bytes _amount);

    function strategyMode() external view returns (Mode);
}
