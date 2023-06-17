// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';
import './SubPool.sol';

contract SubPoolNode is SubPool, Ownable, AccessControl {
    using ManagerLib for ManagerLib.Manager;

    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    address public parentSubPool;
    ManagerLib.Manager public manager;

    event NodeManagerInvited(address indexed _invitedAddress);
    event NodeManagerJoined(address indexed _nodeManagerAddress, uint256 indexed _subPoolID);

    error ParentNotFound();
    error ParentAlreadySet();
    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();

    constructor(address _managerAddress, uint256 _amount, address[] memory _invitedAddresses) {
        manager = ManagerLib.Manager({managerAddress: _managerAddress, initialBalance: _amount, balance: 0});

        _setupInitialInvites(_invitedAddresses);
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    function _setupInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    function setParentSubPool(address _parentSubPool) external onlyOwner {
        if (_checkHasParent()) revert ParentAlreadySet();
        parentSubPool = _parentSubPool;
    }

    function _checkHasParent() internal view returns (bool) {
        return parentSubPool != address(0);
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerAddress(_invitedAddress)) revert ManagerNotAllowed();
        if (_checkIsInvitedAddress(_invitedAddress)) revert AlreadyInvited();
        if (_checkIsNodeManagerAddress(_invitedAddress)) revert AlreadyNodeManager();

        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    function _checkIsManagerAddress(address _address) internal view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function _checkIsInvitedAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    function _checkIsNodeManagerAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }

    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (!_checkHasParent()) revert ParentNotFound();
        if (!_checkIsInvitedAddress(tx.origin)) revert NotInvited();

        uint256 _id = _updateCurrentSubPoolID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({id: _id, initialBalance: _amount, balance: 0});

        _updateNodeManagerRole(tx.origin);
        _updateParentBalance(_amount);

        emit NodeManagerJoined(tx.origin, subPools[_subPoolAddress].id);

        return subPools[_subPoolAddress].id;
    }

    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode(parentSubPool).deposit(address(this), _amount);
    }

    function deposit(address _subPoolAddress, uint256 _amount) public override {
        super.deposit(_subPoolAddress, _amount);

        _updateParentBalance(_amount);

        emit SubPoolDeposited(_subPoolAddress, _amount);
    }
}
