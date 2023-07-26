// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Mode} from '../../libraries/Bytes.sol';

interface IRegistryPivot {
    function strategyMode() external view returns (Mode);
}
