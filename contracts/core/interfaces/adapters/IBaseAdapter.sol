// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IBaseAdapter {
    function getAssets() external view returns (address[] memory);

    function deposit(address depositor_, uint256[] memory amount_) external returns (uint256[] memory);

    function withdraw(address requisitor_, uint256[] memory amount_) external returns (uint256[] memory);
}
