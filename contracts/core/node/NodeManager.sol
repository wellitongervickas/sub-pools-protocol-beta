// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeManager} from '../interfaces/node/INodeManager.sol';
import {Manager} from '../manager/Manager.sol';

contract NodeManager is INodeManager, Manager {
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    bool public override invitedOnly = true;

    constructor(address managerAddress_, address[] memory invitedAddresses_) Manager(managerAddress_) {
        _grantInvites(invitedAddresses_);
    }

    modifier whenNotManager(address address_) {
        if (hasManagerRole(address_)) revert INodeManager.NodeManager_ManagerNotAllowed();
        _;
    }

    modifier whenNotInvited(address address_) {
        if (hasInvitedRole(address_)) revert INodeManager.NodeManager_AlreadyInvited();
        _;
    }

    modifier whenNotNode(address address_) {
        if (hasNodeRole(address_)) revert INodeManager.NodeManager_AlreadyNode();
        _;
    }

    function setInvitedOnly(bool invitedOnly_) external onlyManager(address(this)) {
        invitedOnly = invitedOnly_;
        emit INodeManager.NodeManager_InvitedOnly(invitedOnly_);
    }

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

    function _grantInvites(address[] memory invitedAddresses_) private {
        for (uint256 i = 0; i < invitedAddresses_.length; i++) {
            _grantInvitedRole(invitedAddresses_[i]);
        }
    }

    function _grantInvitedRole(address address_) private {
        _grantRole(INVITED_ROLE, address_);
    }

    function _updateInvitedRole(address address_) internal {
        _revokeInvitedRole(address_);
        _grantNodeRole(address_);
    }

    function _revokeInvitedRole(address address_) private {
        _revokeRole(INVITED_ROLE, address_);
    }

    function _grantNodeRole(address address_) private {
        _grantRole(NODE_ROLE, address_);
    }

    function hasInvitedRole(address address_) public view override returns (bool) {
        return hasRole(INVITED_ROLE, address_);
    }

    function hasNodeRole(address address_) public view override returns (bool) {
        return hasRole(NODE_ROLE, address_);
    }
}
