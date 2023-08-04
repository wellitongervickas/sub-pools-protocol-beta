// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {INode} from '../interfaces/node/INode.sol';
import {NodeManager} from './NodeManager.sol';

contract Node is INode, NodeManager, Ownable {
    /// @inheritdoc INode
    address public immutable override parent;

    /// @inheritdoc INode
    address public immutable override registry;

    /**
     * @notice construct the node contract
     * @param managerAddress_ address of the manager
     * @param invitedAddresses_ addresses of the invited nodes
     * @param parentAddress_ address of the parent node, zero when root
     * @param registryAddress_ address of the registry
     */
    constructor(
        address managerAddress_,
        address[] memory invitedAddresses_,
        address parentAddress_,
        address registryAddress_
    ) NodeManager(managerAddress_, invitedAddresses_) {
        parent = parentAddress_;
        registry = registryAddress_;
    }

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
        address managerAddress_
    ) external onlyRouter checkInvitation(managerAddress_) whenNotNode(_nodeAddress) {
        _updateInvitedRole(managerAddress_);

        emit INode.Node_Joined(_nodeAddress, managerAddress_);
    }
}
