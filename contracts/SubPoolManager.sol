// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './lib/ManagerLib.sol';

contract SubPoolManager is AccessControl {
    using ManagerLib for ManagerLib.Manager;
    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    ManagerLib.Manager public manager;

    event NodeManagerInvited(address indexed _invitedAddress);

    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();
    error NotNodeManager();

    constructor(address _managerAddress, uint256 _amount, FractionLib.Fraction memory _fees) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            fees: _fees
        });
    }

    function _computeManagerFees(uint256 _amount) internal returns (uint256) {
        uint256 _managerAmount = manager._computeFees(_amount);
        _increaseManagerBalance(_managerAmount);

        return _amount.sub(_managerAmount);
    }

    function _increaseManagerBalance(uint256 _amount) internal {
        manager._increaseBalance(_amount);
    }

    function _decreaseManagerBalance(uint256 _amount) internal {
        manager._decreaseBalance(_amount);
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerAddress(_invitedAddress)) revert ManagerNotAllowed();
        if (checkIsInvitedAddress(_invitedAddress)) revert AlreadyInvited();
        if (_checkIsNodeManagerAddress(_invitedAddress)) revert AlreadyNodeManager();

        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    function _setupInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    function _checkIsManagerAddress(address _address) internal view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function checkIsInvitedAddress(address _nodeManagerAddress) public view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    function _checkIsNodeManagerAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }
}
