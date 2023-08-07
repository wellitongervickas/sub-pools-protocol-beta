// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeManager {
    event NodeManager_Invited(address invitedAddress_);

    event NodeManager_InvitedOnly(bool invitedOnly_);

    error NodeManager_ManagerNotAllowed();

    error NodeManager_AlreadyInvited();

    error NodeManager_AlreadyNode();

    function invitedOnly() external view returns (bool);

    function setInvitedOnly(bool invitedOnly_) external;

    function invite(address invitedAddress_) external;

    function hasInvitedRole(address address_) external view returns (bool);

    function hasNodeRole(address address_) external view returns (bool);
}
