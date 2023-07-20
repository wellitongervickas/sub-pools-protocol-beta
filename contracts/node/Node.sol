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
        registry = _registryAddress;
        _setupManager(_managerAddress, _invitedAddresses);
    }

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    function join(
        address _nodeAddress,
        address _managerAddress
    ) external onlyRouter checkInvitation(_managerAddress) whenNotNode(_managerAddress) {
        _setupNode(_nodeAddress, _managerAddress);
        _updateInvitedRole(_managerAddress);
    }
}
