// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManager {
    /// @dev throws if the sender is not a manager
    error Manager_Invalid();

    /**
     * @notice get the manager address
     */
    function managerAddress() external view returns (address);

    /**
     * @notice check if the address has the manager role
     * @param address_ the address to check
     * @return true if the address has the manager role
     */
    function hasManagerRole(address address_) external view returns (bool);
}
