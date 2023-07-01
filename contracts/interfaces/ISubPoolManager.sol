// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ManagerLib} from '../lib/Manager.sol';

interface ISubPoolManager {
    /// @notice Emit when node is invited
    event NodeManagerInvited(address indexed _invitedAddress);

    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();

    /// @notice Invite a new node manager
    /// @param _invitedAddress The address of the invited node manager
    function invite(address _invitedAddress) external;
}
