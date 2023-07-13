// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManagerControl {
    struct Manager {
        address ownerAddress;
    }

    event NodeManagerInvited(address indexed _invitedAddress);

    error ManagerNotAllowed();
    error AlreadyInvited();
    error NotInvited();
    error AlreadyNode();

    function invite(address _invitedAddress) external;

    function setInvitedOnly(bool _invitedOnly) external;

    function hasInvitedRole(address _address) external view returns (bool);
}
