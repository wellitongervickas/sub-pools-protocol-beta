// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './SubPool.sol';
import './SubPoolManager.sol';
import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

import 'hardhat/console.sol';

contract SubPoolNode is SubPool, SubPoolManager, Ownable, AccessControl {
    using ManagerLib for ManagerLib.Manager;
    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    address public parent;

    event NodeManagerInvited(address indexed _invitedAddress);

    error ParentNotFound();
    error ParentAlreadySet();
    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();
    error NotNodeManager();

    constructor(
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) SubPoolManager(_managerAddress, _amount, _fees) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            fees: _fees
        });

        _setupInitialInvites(_invitedAddresses);
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    function _setupInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    function setParent(address _parent) external onlyOwner {
        if (_checkHasParent()) revert ParentAlreadySet();
        parent = _parent;
    }

    function _checkHasParent() internal view returns (bool) {
        return parent != address(0);
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerAddress(_invitedAddress)) revert ManagerNotAllowed();
        if (checkIsInvitedAddress(_invitedAddress)) revert AlreadyInvited();
        if (_checkIsNodeManagerAddress(_invitedAddress)) revert AlreadyNodeManager();

        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
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

    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (!_checkHasParent()) revert ParentNotFound();
        if (!checkIsInvitedAddress(tx.origin)) revert NotInvited();

        uint256 _id = _updateCurrentID();
        uint256 _amountSubTotal = _computeManagerFees(_amount);

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: tx.origin,
            id: _id,
            initialBalance: _amountSubTotal,
            balance: 0
        });

        _updateNodeManagerRole(tx.origin);
        _increaseParentBalance(_amount);

        // emit NodeManagerJoined(tx.origin, subPools[_subPoolAddress].id);

        return subPools[_subPoolAddress].id;
    }

    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    function _increaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).deposit(_amount);
    }

    function _decreaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).withdraw(_amount);
    }

    function deposit(uint256 _amount) public override {
        super.deposit(_amount);
        _increaseParentBalance(_amount);
    }

    function withdraw(uint256 _amount) public override {
        super.withdraw(_amount);
        _decreaseParentBalance(_amount);
    }

    function additionalDeposit(uint256 _amount) external onlyOwner {
        _increaseManagerBalance(_amount);
        _increaseParentBalance(_amount);
    }

    function withdrawFunds(uint256 _amount) external onlyOwner {
        _decreaseManagerBalance(_amount);
        _decreaseParentBalance(_amount);
    }
}
