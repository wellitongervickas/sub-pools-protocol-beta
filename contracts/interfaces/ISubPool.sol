// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {SubPoolLib} from '../lib/SubPool.sol';

interface ISubPool {
    /// @notice Thrown when caller is not allowed to perform action
    error NotAllowed();

    /// @notice Thrown when caller is under lock period
    error LockPeriod();

    /// @notice Throws when parent is not set
    error ParentNotFound();

    /// @notice Throws when parent is already set
    error ParentAlreadySet();

    /// @notice Throws when initial amount is invalid
    error InvalidInitialAmount();

    /// @notice Throws when initial amount is invalid
    error InvalidAdditionalAmount();

    /// @notice Get node by given address
    /// @param _address the address of the node
    /// @return the node
    function subPools(address _address) external view returns (SubPoolLib.SubPool memory);

    /// @notice deposit node balance
    /// @param _amount the amount to deposit
    function deposit(uint256 _amount) external;

    /// @notice decrease node balance
    /// @param _amount the amount to withdraw
    function withdraw(uint256 _amount) external;

    /// @notice decrease node initial balance
    /// @param _amount the amount to cashback
    function cashback(uint256 _amount) external;
}
