// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManager {
    error InvalidManager();

    function hasRoleManager(address _address) external view returns (bool);
}
