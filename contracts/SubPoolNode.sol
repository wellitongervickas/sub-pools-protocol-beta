// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {SubPool, ISubPool} from './SubPool.sol';
import {SubPoolManager, ISubPoolManager} from './SubPoolManager.sol';
import {FractionLib} from './lib/Fraction.sol';

contract SubPoolNode is SubPool, SubPoolManager, Ownable {
    address public parent;
    uint256 public lockPeriod;
    uint256 public requiredInitialAmount;
    uint256 public maxAdditionalAmount;

    /// @dev check if the caller is the router contract
    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    /// @notice create a new node
    /// @param _managerAddress the address of the node manager
    /// @param _amount the amount of the root node as initial deposit
    /// @param _fees the fees of the root node to use as spli ratio
    /// @param _invitedAddresses the addresses to invite as node to the root node
    /// @param _lockPeriod the lock period of the root node
    /// @param _requiredInitialAmount the required initial amount of the root node when node join
    constructor(
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockPeriod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) SubPoolManager(_managerAddress, _amount, _fees) {
        _grantInitialInvites(_invitedAddresses);
        _setLockPeriod(_lockPeriod);
        _setRequiredInitialAmount(_requiredInitialAmount);
        _setMaxAdditionalDeposit(_maxAdditionalDeposit);
    }

    /// @notice set the lock period of the node
    /// @param _lockPeriod the lock period of the node in seconds
    function _setLockPeriod(uint256 _lockPeriod) internal {
        lockPeriod = _lockPeriod;
    }

    /// @notice set the required initial amount of the node
    /// @param _requiredInitialAmount the required initial amount of the node
    function _setRequiredInitialAmount(uint256 _requiredInitialAmount) internal {
        requiredInitialAmount = _requiredInitialAmount;
    }

    /// @notice set the max additional deposit of the node
    /// @param _maxAdditionalDeposit the max additional deposit of the node
    function _setMaxAdditionalDeposit(uint256 _maxAdditionalDeposit) internal {
        maxAdditionalAmount = _maxAdditionalDeposit;
    }

    /// @notice set the parent node address. Only router can set once.
    /// @param _parent the address of the parent node
    function setParent(address _parent) external onlyRouter {
        if (_checkHasParent()) revert ISubPool.ParentAlreadySet();
        parent = _parent;
    }

    /// @notice join as children node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount of the node as initial deposit
    /// @return the id of the new node
    function join(address _nodeAddress, uint256 _amount) external onlyRouter returns (uint256) {
        if (!_checkAmountInitialBalance(_amount)) revert ISubPool.InvalidInitialAmount();
        if (!_checkHasParent()) revert ISubPool.ParentNotFound();
        if (!_checkIsInvitedRole(tx.origin)) revert ISubPoolManager.NotInvited();

        uint256 _amountSubTotal = _computeManagerFees(_amount);
        uint256 _id = _setupNode(_nodeAddress, msg.sender, _amountSubTotal);

        _updateManagerRole(tx.origin);
        _increaseParentBalance(_amount);

        return _id;
    }

    /// @notice check if node has parent
    /// @return true if node has parent
    function _checkHasParent() internal view returns (bool) {
        return parent != address(0);
    }

    /// @notice check if the amount is equal to required initial amount, if zero is not required
    /// @param _amount the amount to check
    /// @return true if the amount is equal to required initial amount
    function _checkAmountInitialBalance(uint256 _amount) internal view returns (bool) {
        if (requiredInitialAmount == 0) return true;
        return _amount == requiredInitialAmount;
    }

    function deposit(uint256 _amount) public override OnlyNode(msg.sender) {
        super.deposit(_amount);
        _increaseParentBalance(_amount);
    }

    function withdraw(uint256 _amount) public override OnlyNode(msg.sender) {
        super.withdraw(_amount);
        _decreaseParentBalance(_amount);
    }

    function cashback(uint256 _amount) public override OnlyNode(msg.sender) {
        super.cashback(_amount);
        _decreaseParentInitialBalance(_amount);
    }

    function additionalDeposit(uint256 _amount) external onlyRouter {
        _increaseManagerBalance(_amount);
        _increaseParentBalance(_amount);
    }

    function withdrawBalance(uint256 _amount) external onlyRouter {
        _decreaseManagerBalance(_amount);
        _decreaseParentBalance(_amount);
    }

    function withdrawInitialBalance(uint256 _amount) external onlyRouter {
        _decreaseManagerInitialBalance(_amount);
        _decreaseParentInitialBalance(_amount);
    }

    function _increaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).deposit(_amount);
    }

    function _decreaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).withdraw(_amount);
    }

    function _decreaseParentInitialBalance(uint256 _amount) internal onlyUnlockedPeriod(lockPeriod) {
        SubPoolNode(parent).cashback(_amount);
    }
}
