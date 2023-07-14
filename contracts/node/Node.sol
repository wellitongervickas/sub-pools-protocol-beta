// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INode} from '../interfaces/node/INode.sol';

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {NodeControl} from './NodeControl.sol';
import {ManagerControl} from '../manager/ManagerControl.sol';

contract Node is INode, NodeControl, ManagerControl, Ownable {
    address public immutable parent;
    address public immutable registry;

    constructor(
        address _parentAddress,
        address _ownerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) ManagerControl(_ownerAddress, _invitedAddresses) {
        parent = _parentAddress;
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
