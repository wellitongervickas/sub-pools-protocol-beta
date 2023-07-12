// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

import {ManagerLib} from '../libraries/Manager.sol';

contract ManagerControl is AccessControl {
    bytes32 private constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 private constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 private constant NODE_ROLE = keccak256('NODE_ROLE');

    ManagerLib.Manager public manager;

    bool public invitedOnly = true;

    event NodeManagerInvited(address indexed _invitedAddress);

    error NotAllowed();
    error AlreadyInvited();
    error NotInvited();
    error AlreadyNode();

    modifier whenNotManager(address _address) {
        if (hasRoleManager(_address)) revert NotAllowed();
        _;
    }

    modifier whenNotInvited(address _address) {
        if (hasInvitedRole(_address)) revert AlreadyInvited();
        _;
    }

    modifier whenNotNode(address _address) {
        if (hasNodeRole(_address)) revert AlreadyNode();
        _;
    }

    constructor(address _managerAddress, address[] memory _invitedAddresses) {
        manager = ManagerLib.Manager({managerAddress: _managerAddress});
        _setManagerRole(manager);
        _grantInvites(_invitedAddresses);
    }

    function _setManagerRole(ManagerLib.Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.managerAddress);
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
        emit NodeManagerInvited(_invitedAddress);
    }

    function _grantInvites(address[] memory _invitedAddresses) private {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
            emit NodeManagerInvited(_invitedAddresses[i]);
        }
    }

    function setInvitedOnly(bool _invitedOnly) external onlyRole(MANAGER_ROLE) {
        invitedOnly = _invitedOnly;
    }

    function _updateInvitedRole(address _address) internal {
        _revokeRole(INVITED_ROLE, _address);
        _grantRole(NODE_ROLE, _address);
    }

    function hasInvitedRole(address _address) public view returns (bool) {
        return hasRole(INVITED_ROLE, _address);
    }

    function hasRoleManager(address _address) public view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function hasNodeRole(address _address) private view returns (bool) {
        return hasRole(NODE_ROLE, _address);
    }
}
