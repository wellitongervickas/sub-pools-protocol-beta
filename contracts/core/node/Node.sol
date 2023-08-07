// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {INode} from '../interfaces/node/INode.sol';
import {NodeManager} from './NodeManager.sol';

contract Node is INode, NodeManager, Ownable {
    address public immutable override parent;

    constructor(
        address managerAddress_,
        address[] memory invitedAddresses_,
        address parentAddress_
    ) NodeManager(managerAddress_, invitedAddresses_) {
        parent = parentAddress_;
    }

    modifier checkInvitation(address _address) {
        bool _isInvited = hasInvitedRole(_address);
        if (invitedOnly && !_isInvited) revert INode.Node_NotInvited();
        _;
    }

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    function join(
        address _nodeAddress,
        address managerAddress_
    ) external onlyRouter checkInvitation(managerAddress_) whenNotNode(_nodeAddress) {
        _updateInvitedRole(managerAddress_);

        emit INode.Node_Joined(_nodeAddress, managerAddress_);
    }
}
