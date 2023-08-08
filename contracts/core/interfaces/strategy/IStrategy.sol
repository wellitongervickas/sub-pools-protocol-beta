// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IStrategy {
    function assets() external view returns (address[] memory);

    function deposit(address _depositor, uint256[] memory _amount) external returns (uint256[] memory);

    function withdraw(address _requisitor, uint256[] memory _amount) external returns (uint256[] memory);
}
