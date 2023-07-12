// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {NodeControl} from './NodeControl.sol';
import {ManagerControl} from '../manager/ManagerControl.sol';

contract Node is NodeControl, ManagerControl, Ownable {
    Node public immutable parent;

    constructor(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses
    ) ManagerControl(_managerAddress, _invitedAddresses) {
        parent = Node(_parentAddress);
    }

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier checkInvitation(address _invitedAddress) {
        bool _isInvited = hasInvitedRole(_invitedAddress);
        if (invitedOnly && !_isInvited) revert NotInvited();
        _;
    }

    function join(
        address _nodeAddress,
        address _managerAddress
    ) external checkInvitation(_managerAddress) whenNotNode(_managerAddress) onlyRouter {
        _setupNode(_nodeAddress, _managerAddress);
        _updateInvitedRole(_managerAddress);
    }
}
