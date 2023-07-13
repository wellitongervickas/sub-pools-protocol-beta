// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INode} from '../interfaces/node/INode.sol';

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {NodeControl} from './NodeControl.sol';
import {ManagerControl} from '../manager/ManagerControl.sol';

contract Node is INode, NodeControl, ManagerControl, Ownable {
    address public immutable parent;

    constructor(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses
    ) ManagerControl(_managerAddress, _invitedAddresses) {
        parent = _parentAddress;
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
