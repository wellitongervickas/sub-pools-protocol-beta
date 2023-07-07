// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IStrategyProxy {
    function deposit(bytes calldata _data) external;

    function harvest() external;
}
