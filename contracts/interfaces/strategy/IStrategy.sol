// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Mode} from '../../libraries/Bytes.sol';

interface IStrategy {
    function mode() external view returns (Mode);

    function token() external view returns (bytes memory);

    function deposit(address _depositor, bytes memory _amount) external;

    function withdraw(address _requisitor, bytes memory _amount) external;
}
