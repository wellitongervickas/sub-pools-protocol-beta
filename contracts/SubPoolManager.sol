// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

import {ISubPoolManager} from './interfaces/ISubPoolManager.sol';
import {ManagerLib} from './lib/Manager.sol';
import {FractionLib} from './lib/Fraction.sol';

contract SubPoolManager is ISubPoolManager, AccessControl {
    using ManagerLib for ManagerLib.Manager;

    bytes32 private constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 private constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 private constant NODE_ROLE = keccak256('NODE_ROLE');

    ManagerLib.Manager public manager;

    /// @notice create a new manager
    /// @param _managerAddress the address of the manager
    /// @param _amount the amount of the manager as initial deposit
    /// @param _fees the fees of the manager to use as split ratio
    constructor(address _managerAddress, uint256 _amount, FractionLib.Fraction memory _fees) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            fees: _fees
        });

        _setManagerRole(manager);
    }

    /// @notice setup manager role
    /// @param _manager the manager to set as manager role
    function _setManagerRole(ManagerLib.Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.managerAddress);
    }

    /// @notice compute the manager fees
    /// @param _amount the amount to compute the fees
    /// @return the remaining amount after fees
    function _computeManagerFees(uint256 _amount) internal returns (uint256) {
        uint256 _managerAmount = manager._calculateRatioFees(_amount);
        _increaseManagerBalance(_managerAmount);

        return _amount - _managerAmount;
    }

    /// @notice increase the manager balance
    /// @param _amount the amount to increase the balance
    function _increaseManagerBalance(uint256 _amount) internal {
        manager._increaseBalance(_amount);
    }

    /// @notice decrease the manager balance
    /// @param _amount the amount to decrease the balance
    function _decreaseManagerBalance(uint256 _amount) internal {
        manager._decreaseBalance(_amount);
    }

    /// @notice increase the manager initial balance
    /// @param _amount the amount to increase the initial balance
    function _decreaseManagerInitialBalance(uint256 _amount) internal {
        manager._decreaseInitialBalance(_amount);
    }

    /// @inheritdoc ISubPoolManager
    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerRole(_invitedAddress)) revert ISubPoolManager.ManagerNotAllowed();
        if (_checkIsInvitedRole(_invitedAddress)) revert ISubPoolManager.AlreadyInvited();
        if (_checkIsNodeRole(_invitedAddress)) revert ISubPoolManager.AlreadyNodeManager();

        /// @dev Grant the invited role to the invited address
        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    /// @notice grant invited role to multiple addresses
    /// @param _invitedAddresses the addresses to grant the invited role
    function _grantInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            /// @dev Grant the invited role to the invited address
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    /// @notice revoke invited role to and set as node role
    /// @param _nodeManagerAddress the addresse to revoke the invited role and set as node role
    function _updateInvitedRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    /// @notice check if has manager role
    /// @param _address the address to check if has manager role
    function _checkIsManagerRole(address _address) private view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    /// @notice check if has invited role
    /// @param _nodeManagerAddress the address to check if has invited role
    function _checkIsInvitedRole(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    /// @notice check if has node role
    /// @param _nodeManagerAddress the address to check if has node role
    function _checkIsNodeRole(address _nodeManagerAddress) private view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }
}
