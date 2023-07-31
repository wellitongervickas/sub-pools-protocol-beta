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
     * @param _parentAddress address of the parent node
     * @param _registryAddress address of the registry
     * @param _managerAddress address of the manager
     * @param _invitedAddresses addresses of the invited nodes
     */
    constructor(
        address _parentAddress,
        address _registryAddress,
        address _managerAddress,
        address[] memory _invitedAddresses
    ) NodeManager(_managerAddress, _invitedAddresses) {
        parent = _parentAddress;
        registry = _registryAddress;
    }

    /// @dev modifier to check if _address is invited when invited only mode
    modifier checkInvitation(address _address) {
        bool _isInvited = hasInvitedRole(_address);
        if (invitedOnly && !_isInvited) revert INode.Node_NotInvited();
        _;
    }

    /// @dev modifier to check if the sender is the owner
    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    /// @dev modifier to check if the address is not a node
    modifier whenNotJoined(address _address) {
        if (hasNodeRole(_address)) revert INode.Node_AlreadyJoined();
        _;
    }

    ///@inheritdoc INode
    function join(
        address _nodeAddress,
        address _managerAddress
    ) external onlyRouter checkInvitation(_managerAddress) whenNotJoined(_nodeAddress) {
        _updateInvitedRole(_managerAddress);

        emit INode.Node_Joined(_nodeAddress, _managerAddress);
    }

    /// @dev check if the invited address is not joined yet
    function invite(address _invitedAddress) public override whenNotJoined(_invitedAddress) {
        super.invite(_invitedAddress);
    }
}
