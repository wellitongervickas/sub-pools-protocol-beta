// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {INode} from '../interfaces/node/INode.sol';
import {NodeControl} from './NodeControl.sol';
import {Manager} from '../manager/Manager.sol';

contract Node is INode, NodeControl, Manager, Ownable {
    address public immutable parent;
    address public immutable registry;

    constructor(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) {
        parent = _parentAddress;
        _setupManager(_managerAddress, _invitedAddresses);
        registry = _registryAddress;
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
        address _nodeOwnerAddress
    ) external checkInvitation(_nodeOwnerAddress) whenNotNode(_nodeOwnerAddress) onlyRouter {
        _setupNode(_nodeAddress, _nodeOwnerAddress);
        _updateInvitedRole(_nodeOwnerAddress);
    }
}
