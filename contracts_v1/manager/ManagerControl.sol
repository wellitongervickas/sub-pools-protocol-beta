// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

import {IManagerControl} from '../interfaces/manager/IManagerControl.sol';
import {ManagerLib} from '../lib/Manager.sol';
import {FractionLib} from '../lib/Fraction.sol';

contract ManagerControl is IManagerControl, AccessControl {
    using ManagerLib for ManagerLib.Manager;

    bytes32 private constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 private constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 private constant NODE_ROLE = keccak256('NODE_ROLE');
    bool public invitedOnly = false;

    ManagerLib.Manager public manager;

    modifier whenNotInvitedOnly() {
        if (!invitedOnly) revert IManagerControl.NotInvitedOnly();
        _;
    }

    constructor(address _managerAddress, uint256 _amount, FractionLib.Fraction memory _fees) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            fees: _fees
        });

        _setManagerRole(manager);
    }

    function _setManagerRole(ManagerLib.Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.managerAddress);
    }

    function _computeManagerFees(uint256 _amount) internal returns (uint256) {
        uint256 _managerAmount = manager._calculateRatioFees(_amount);
        _increaseManagerBalance(_managerAmount);

        return _amount - _managerAmount;
    }

    function _increaseManagerBalance(uint256 _amount) internal {
        manager._increaseBalance(_amount);
    }

    function _decreaseManagerBalance(uint256 _amount) internal virtual {
        manager._decreaseBalance(_amount);
    }

    function _decreaseManagerInitialBalance(uint256 _amount) internal virtual {
        manager._decreaseInitialBalance(_amount);
    }

    function _setIsInvitedOnly(bool _invitedOnly) private {
        invitedOnly = _invitedOnly;
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) whenNotInvitedOnly {
        if (_checkIsManagerRole(_invitedAddress)) revert IManagerControl.ManagerNotAllowed();
        if (_checkIsInvitedRole(_invitedAddress)) revert IManagerControl.AlreadyInvited();
        if (_checkIsNodeRole(_invitedAddress)) revert IManagerControl.AlreadyNodeManager();

        _setIsInvitedOnly(true);
        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    function _grantInvites(address[] memory _invitedAddresses) internal {
        if (_invitedAddresses.length > 0) {
            _setIsInvitedOnly(true);
        }

        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    function _updateInvitedRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    function _checkIsManagerRole(address _address) private view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function _checkIsInvitedRole(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    function _checkIsNodeRole(address _nodeManagerAddress) private view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }
}
