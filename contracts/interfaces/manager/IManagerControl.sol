// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManagerControl {
    event NodeManagerInvited(address indexed _invitedAddress);

    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error NotInvitedOnly();
    error AlreadyInvited();
    error NotEnoughBalance();

    function invite(address _invitedAddress) external;
}
