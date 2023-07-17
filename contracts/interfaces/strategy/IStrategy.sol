// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

enum StrategyType {
    Single
}

interface IStrategy {
    function token() external view returns (bytes memory);

    function deposit(bytes memory _amount) external;
}
