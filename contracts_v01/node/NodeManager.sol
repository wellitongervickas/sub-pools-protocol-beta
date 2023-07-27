// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Manager} from '../manager/Manager.sol';
import {INodeManager} from '../interfaces/node/INodeManager.sol';

contract NodeManager is INodeManager, Manager {
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    INodeManager.Manager public manager;

    bool public override invitedOnly = true;

    modifier checkInvitation(address _invitedAddress) {
        bool _isInvited = hasInvitedRole(_invitedAddress);
        if (invitedOnly && !_isInvited) revert INodeManager.NotInvited();
        _;
    }

    modifier whenNotManager(address _address) {
        if (hasRoleManager(_address)) revert INodeManager.ManagerNotAllowed();
        _;
    }

    modifier whenNotInvited(address _address) {
        if (hasInvitedRole(_address)) revert INodeManager.AlreadyInvited();
        _;
    }

    modifier whenNotNode(address _address) {
        if (hasNodeRole(_address)) revert INodeManager.AlreadyNode();
        _;
    }

    function setInvitedOnly(bool _invitedOnly) external onlyManager(address(this)) {
        invitedOnly = _invitedOnly;
    }

    function invite(
        address _invitedAddress
    )
        external
        onlyManager(address(this))
        whenNotInvited(_invitedAddress)
        whenNotNode(_invitedAddress)
        whenNotManager(_invitedAddress)
    {
        _grantRole(INVITED_ROLE, _invitedAddress);
        emit INodeManager.NodeManagerInvited(_invitedAddress);
    }

    function _setupManager(address _managerAddress, address[] memory _invitedAddresses) internal {
        manager = INodeManager.Manager({managerAddress: _managerAddress});

        _setManagerRole(_managerAddress);
        _grantInvites(_invitedAddresses);
    }

    function _grantInvites(address[] memory _invitedAddresses) private {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
            emit INodeManager.NodeManagerInvited(_invitedAddresses[i]);
        }
    }

    function _updateInvitedRole(address _address) internal {
        _revokeRole(INVITED_ROLE, _address);
        _grantRole(NODE_ROLE, _address);
    }

    function hasInvitedRole(address _address) public view returns (bool) {
        return hasRole(INVITED_ROLE, _address);
    }

    function hasNodeRole(address _address) internal view returns (bool) {
        return hasRole(NODE_ROLE, _address);
    }
}
