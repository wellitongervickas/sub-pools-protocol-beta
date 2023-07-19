// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Mode} from '../../libraries/Decoder.sol';

interface IStrategy {
    function strategyType() external view returns (Mode);

    function token() external view returns (bytes memory);

    function deposit(bytes memory _amount) external;
}
