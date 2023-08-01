// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeManager} from '../interfaces/node/INodeManager.sol';
import {Manager} from '../manager/Manager.sol';

contract NodeManager is INodeManager, Manager {
    /// @dev role that has invited control rights
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    /// @dev role that has node control rights
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    /// @inheritdoc INodeManager
    bool public override invitedOnly = true;

    event InvitedRoleUpdated(address indexed _address, bytes32 _newRole);

    /**
     * @notice construct the node manager contract
     * @param _managerAddress the address of the manager
     * @param _invitedAddresses the addresses of the invited nodes
     */
    constructor(address _managerAddress, address[] memory _invitedAddresses) Manager(_managerAddress) {
        _grantInvites(_invitedAddresses);
    }

    /// @dev modifier to check if the address is not a manager
    modifier whenNotManager(address _address) {
        if (hasManagerRole(_address)) revert INodeManager.NodeManager_ManagerNotAllowed();
        _;
    }

    /// @dev modifier to check if the address is not invited
    modifier whenNotInvited(address _address) {
        if (hasInvitedRole(_address)) revert INodeManager.NodeManager_AlreadyInvited();
        _;
    }

    /// @dev modifier to check if the address is not a node
    modifier whenNotNode(address _address) {
        if (hasNodeRole(_address)) revert INodeManager.NodeManager_AlreadyNode();
        _;
    }

    /// @inheritdoc INodeManager
    function setInvitedOnly(bool _invitedOnly) external onlyManager(address(this)) {
        invitedOnly = _invitedOnly;
        emit INodeManager.NodeManager_InvitedOnly(_invitedOnly);
    }

    /// @inheritdoc INodeManager
    function invite(
        address _invitedAddress
    )
        public
        virtual
        onlyManager(address(this))
        whenNotInvited(_invitedAddress)
        whenNotManager(_invitedAddress)
        whenNotNode(_invitedAddress)
    {
        _grantInvitedRole(_invitedAddress);
        emit INodeManager.NodeManager_Invited(_invitedAddress);
    }

    /**
     * @dev grant the invited role to the invited addresses
     * @param _invitedAddresses the addresses of the invited nodes
     * @dev the invited addresses are granted the invited role
     * @dev emits a {NodeManager_Invited} event
     */
    function _grantInvites(address[] memory _invitedAddresses) private {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantInvitedRole(_invitedAddresses[i]);
            emit INodeManager.NodeManager_Invited(_invitedAddresses[i]);
        }
    }

    /**
     * @notice grant the invited role to the node
     * @param _address the address of the node
     * @dev the node address is granted the invited role
     * @dev emits a {InvitedRoleUpdated} event
     */
    function _grantInvitedRole(address _address) private {
        _grantRole(INVITED_ROLE, _address);

        emit InvitedRoleUpdated(_address, INVITED_ROLE);
    }

    /**
     *
     * @param _address the address of the node
     * @dev the node address is revoked the invited role
     * @dev the node address is granted the node role
     * @dev emits a {InvitedRoleUpdated} event
     */
    function _updateInvitedRole(address _address) internal {
        _revokeInvitedRole(_address);
        _grantNodeRole(_address);

        emit InvitedRoleUpdated(_address, NODE_ROLE);
    }

    /**
     * @dev revoke the invited role to the node
     * @param _address the address of the node
     */
    function _revokeInvitedRole(address _address) private {
        _revokeRole(INVITED_ROLE, _address);
    }

    /**
     * @dev grant the node role to the node
     * @param _address the address of the node
     * @dev emits a {InvitedRoleUpdated} event
     */
    function _grantNodeRole(address _address) private {
        _grantRole(NODE_ROLE, _address);

        emit InvitedRoleUpdated(_address, NODE_ROLE);
    }

    /// @inheritdoc INodeManager
    function hasInvitedRole(address _address) public view override returns (bool) {
        return hasRole(INVITED_ROLE, _address);
    }

    /// @inheritdoc INodeManager
    function hasNodeRole(address _address) public view override returns (bool) {
        return hasRole(NODE_ROLE, _address);
    }
}
