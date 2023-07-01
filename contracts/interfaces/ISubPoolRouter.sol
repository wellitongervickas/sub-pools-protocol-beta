// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from '../lib/Fraction.sol';

interface ISubPoolRouter {
    /// @notice Emit when node is created
    event NodeCreated(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    /// @notice Emit when node is joined
    event NodeJoined(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    /// @notice Emit whe node manager ddposited
    event ManagerDeposited(address indexed _managerAddress, uint256 _amount);
    /// @notice Emit when node manager withdrew
    event ManagerWithdrew(address indexed _managerAddress, uint256 _amount);

    /// @notice Throws when try to call only manager function
    error NotNodeManager();

    /// @notice create a new root node
    /// @param _amount the amount of the root node as initial deposit
    /// @param _fees the fees of the root node to use as spli ratio
    /// @param _invitedAddresses the addresses to invite as node to the root node
    /// @param _lockperiod the lock period of the root node
    /// @param _requiredInitialAmount the required initial amount of the root node when node join
    /// @return the address of the new root node
    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount
    ) external returns (address);

    /// @notice join as children node to parent node
    /// @param _parentNodeAddress the address of the parent node
    /// @param _amount the amount of the node as initial deposit
    /// @param _fees the fees of the node to use as split ratio
    /// @param _invitedAddresses the addresses to invite as node to the node
    /// @param _lockperiod the lock period of the node
    /// @param _requiredInitialAmount the required initial amount of the node when node join
    /// @return the address of the new node
    function join(
        address _parentNodeAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount
    ) external returns (address);
}
