// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IManager} from '../interfaces/manager/IManager.sol';
import {ManagerControl, IManagerControl} from '../manager/ManagerControl.sol';

contract Manager is IManager, ManagerControl {
    bool public invitedOnly = true;

    modifier whenNotManager(address _address) {
        if (hasRoleManager(_address)) revert IManagerControl.ManagerNotAllowed();
        _;
    }

    modifier whenNotInvited(address _address) {
        if (hasInvitedRole(_address)) revert IManagerControl.AlreadyInvited();
        _;
    }

    modifier whenNotNode(address _address) {
        if (hasNodeRole(_address)) revert IManagerControl.AlreadyNode();
        _;
    }

    function setInvitedOnly(bool _invitedOnly) external onlyRole(MANAGER_ROLE) {
        invitedOnly = _invitedOnly;
    }

    function invite(
        address _invitedAddress
    )
        external
        onlyRole(ManagerControl.MANAGER_ROLE)
        whenNotInvited(_invitedAddress)
        whenNotNode(_invitedAddress)
        whenNotManager(_invitedAddress)
    {
        _grantRole(ManagerControl.INVITED_ROLE, _invitedAddress);
        emit IManagerControl.NodeManagerInvited(_invitedAddress);
    }
}
