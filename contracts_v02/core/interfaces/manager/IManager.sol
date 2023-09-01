// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManager {
    error Manager_Invalid();

    function managerAddress() external view returns (address);

    function hasManagerRole(address address_) external view returns (bool);
}
