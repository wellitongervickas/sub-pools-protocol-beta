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

    /**
     * @notice construct the node manager contract
     * @param managerAddress_ the address of the manager
     * @param invitedAddresses_ the addresses of the invited nodes
     */
    constructor(address managerAddress_, address[] memory invitedAddresses_) Manager(managerAddress_) {
        _grantInvites(invitedAddresses_);
    }

    /// @dev modifier to check if the address is not a manager
    modifier whenNotManager(address address_) {
        if (hasManagerRole(address_)) revert INodeManager.NodeManager_ManagerNotAllowed();
        _;
    }

    /// @dev modifier to check if the address is not invited
    modifier whenNotInvited(address address_) {
        if (hasInvitedRole(address_)) revert INodeManager.NodeManager_AlreadyInvited();
        _;
    }

    /// @dev modifier to check if the address is not a node
    modifier whenNotNode(address address_) {
        if (hasNodeRole(address_)) revert INodeManager.NodeManager_AlreadyNode();
        _;
    }

    /// @inheritdoc INodeManager
    function setInvitedOnly(bool invitedOnly_) external onlyManager(address(this)) {
        invitedOnly = invitedOnly_;
        emit INodeManager.NodeManager_InvitedOnly(invitedOnly_);
    }

    /// @inheritdoc INodeManager
    function invite(
        address invitedAddress_
    )
        external
        virtual
        onlyManager(address(this))
        whenNotInvited(invitedAddress_)
        whenNotManager(invitedAddress_)
        whenNotNode(invitedAddress_)
    {
        _grantInvitedRole(invitedAddress_);
        emit INodeManager.NodeManager_Invited(invitedAddress_);
    }

    /**
     * @dev grant the invited role to the invited addresses
     * @param invitedAddresses_ the addresses of the invited nodes
     * @dev the invited addresses are granted the invited role
     * @dev emits a {NodeManager_Invited} event
     */
    function _grantInvites(address[] memory invitedAddresses_) private {
        for (uint256 i = 0; i < invitedAddresses_.length; i++) {
            _grantInvitedRole(invitedAddresses_[i]);
        }
    }

    /**
     * @notice grant the invited role to the node
     * @param address_ the address of the node
     * @dev the node address is granted the invited role
     * @dev emits a {NodeManager_RoleUpdated} event
     */
    function _grantInvitedRole(address address_) private {
        _grantRole(INVITED_ROLE, address_);
    }

    /**
     *
     * @param address_ the address of the node
     * @dev the node address is revoked the invited role
     * @dev the node address is granted the node role
     * @dev emits a {NodeManager_RoleUpdated} event
     */
    function _updateInvitedRole(address address_) internal {
        _revokeInvitedRole(address_);
        _grantNodeRole(address_);
    }

    /**
     * @dev revoke the invited role to the node
     * @param address_ the address of the node
     */
    function _revokeInvitedRole(address address_) private {
        _revokeRole(INVITED_ROLE, address_);
    }

    /**
     * @dev grant the node role to the node
     * @param address_ the address of the node
     * @dev emits a {NodeManager_RoleUpdated} event
     */
    function _grantNodeRole(address address_) private {
        _grantRole(NODE_ROLE, address_);
    }

    /// @inheritdoc INodeManager
    function hasInvitedRole(address address_) public view override returns (bool) {
        return hasRole(INVITED_ROLE, address_);
    }

    /// @inheritdoc INodeManager
    function hasNodeRole(address address_) public view override returns (bool) {
        return hasRole(NODE_ROLE, address_);
    }
}
