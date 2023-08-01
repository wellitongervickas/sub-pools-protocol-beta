// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {INode} from '../interfaces/node/INode.sol';
import {NodeManager} from './NodeManager.sol';

contract Node is INode, NodeManager, Ownable {
    /// @inheritdoc INode
    // address public immutable override parent;

    /// @inheritdoc INode
    // address public immutable override registry;

    /**
     * @notice construct the node contract
     * @param _managerAddress address of the manager
     * @param _invitedAddresses addresses of the invited nodes
     */
    constructor(
        address _managerAddress,
        address[] memory _invitedAddresses
    ) NodeManager(_managerAddress, _invitedAddresses) {}

    /// @dev modifier to check if _address is invited when invited only mode
    modifier checkInvitation(address _address) {
        bool _isInvited = hasInvitedRole(_address);
        if (invitedOnly && !_isInvited) revert INode.Node_NotInvited();
        _;
    }

    /// @dev modifier to check if the sender is the router
    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    ///@inheritdoc INode
    function join(
        address _nodeAddress,
        address _managerAddress
    ) external onlyRouter checkInvitation(_managerAddress) whenNotNode(_nodeAddress) {
        _updateInvitedRole(_managerAddress);

        emit INode.Node_Joined(_nodeAddress, _managerAddress);
    }
}