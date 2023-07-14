// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IManager} from '../interfaces/manager/IManager.sol';
import {ManagerControl, IManagerControl} from '../manager/ManagerControl.sol';

contract Manager is IManager, ManagerControl {
    bool public invitedOnly = true;

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
