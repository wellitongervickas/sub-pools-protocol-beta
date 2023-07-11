// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IStrategy {
    function setup(bytes calldata _setup) external;

    function deposit(bytes calldata _amount) external;

    function harvest() external;

    function withdraw(bytes calldata _amount) external;
}
