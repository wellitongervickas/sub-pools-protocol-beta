// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IStrategy {
    function token() external view returns (bytes memory);

    function deposit(address _depositor, bytes memory _amount) external returns (bytes memory);

    function withdraw(address _requisitor, bytes memory _amount) external returns (bytes memory);
}
