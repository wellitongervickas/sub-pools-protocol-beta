// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IManagerControl} from '../interfaces/manager/IManagerControl.sol';

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

contract ManagerControl is IManagerControl, AccessControl {
    bytes32 private constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 private constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 private constant NODE_ROLE = keccak256('NODE_ROLE');

    IManagerControl.Manager public manager;

    bool public invitedOnly = true;

    modifier whenNotManager(address _address) {
        if (hasRoleManager(_address)) revert IManagerControl.ManagerNotAllowed();
        _;
    }

    modifier whenNotInvited(address _address) {
        if (hasInvitedRole(_address)) revert IManagerControl.AlreadyInvited();
        _;
    }

    modifier whenNotNode(address _address) {
        if (hasNodeRole(_address)) revert IManagerControl.AlreadyNode();
        _;
    }

    constructor(address _ownerAddress, address[] memory _invitedAddresses) {
        manager = IManagerControl.Manager({ownerAddress: _ownerAddress});
        _setManagerRole(manager);
        _grantInvites(_invitedAddresses);
    }

    function _setManagerRole(Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.ownerAddress);
    }

    function setInvitedOnly(bool _invitedOnly) external onlyRole(MANAGER_ROLE) {
        invitedOnly = _invitedOnly;
    }

    function invite(
        address _invitedAddress
    )
        external
        onlyRole(MANAGER_ROLE)
        whenNotInvited(_invitedAddress)
        whenNotNode(_invitedAddress)
        whenNotManager(_invitedAddress)
    {
        _grantRole(INVITED_ROLE, _invitedAddress);
        emit IManagerControl.NodeManagerInvited(_invitedAddress);
    }

    function _grantInvites(address[] memory _invitedAddresses) private {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
            emit IManagerControl.NodeManagerInvited(_invitedAddresses[i]);
        }
    }

    function _updateInvitedRole(address _address) internal {
        _revokeRole(INVITED_ROLE, _address);
        _grantRole(NODE_ROLE, _address);
    }

    function hasInvitedRole(address _address) public view returns (bool) {
        return hasRole(INVITED_ROLE, _address);
    }

    function hasRoleManager(address _address) private view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function hasNodeRole(address _address) private view returns (bool) {
        return hasRole(NODE_ROLE, _address);
    }
}
