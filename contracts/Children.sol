// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ChildrenControl, IChildrenControl} from './ChildrenControl.sol';
import {IChildren} from './interfaces/IChildren.sol';
import {Manager, IManager} from './Manager.sol';
import {FractionLib} from './lib/Fraction.sol';
import {ChildrenLib} from './lib/Children.sol';

contract Children is IChildren, ChildrenControl, Manager, Ownable {
    address public parent; // only set once
    uint256 public immutable lockPeriod;
    uint256 public immutable requiredInitialAmount;
    uint256 public immutable maxAdditionalAmount;

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier checkMaxAdditionalAmount(uint256 _amount) {
        ChildrenLib.Children memory _node = children(msg.sender);
        uint256 _subTotal = _node.balance + _amount;
        bool isGreaterThanLimit = maxAdditionalAmount > 0 && _subTotal > maxAdditionalAmount;

        if (isGreaterThanLimit) revert IChildren.ExceedMaxAdditionalDeposit();
        _;
    }

    constructor(
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockPeriod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) Manager(_managerAddress, _amount, _fees) {
        requiredInitialAmount = _requiredInitialAmount;
        lockPeriod = _lockPeriod;
        maxAdditionalAmount = _maxAdditionalDeposit;

        _grantInitialInvites(_invitedAddresses);
    }

    function setParent(address _parent) external onlyRouter {
        if (_checkHasParent()) revert IChildrenControl.ParentAlreadySet();
        parent = _parent;
    }

    function join(
        address _nodeAddress,
        address _invitedAddress,
        uint256 _amount
    ) external onlyRouter returns (uint256) {
        if (!_checkAmountInitialBalance(_amount)) revert IChildrenControl.InvalidInitialAmount();
        if (!_checkHasParent()) revert IChildrenControl.ParentNotFound();
        if (!_checkIsInvitedRole(_invitedAddress)) revert IManager.NotInvited();

        uint256 _remainingAmount = _computeManagerFees(_amount);
        uint256 _id = _setupChildren(_nodeAddress, _invitedAddress, _remainingAmount);

        _updateInvitedRole(_invitedAddress);
        _increaseParentBalance(_amount);

        return _id;
    }

    function _checkHasParent() private view returns (bool) {
        return parent != address(0);
    }

    function _checkAmountInitialBalance(uint256 _amount) private view returns (bool) {
        if (requiredInitialAmount == 0) return true;
        return _amount == requiredInitialAmount;
    }

    function deposit(uint256 _amount) public override OnlyChildren(msg.sender) checkMaxAdditionalAmount(_amount) {
        super.deposit(_amount);
        _increaseParentBalance(_amount);
    }

    function withdraw(uint256 _amount) public override OnlyChildren(msg.sender) {
        super.withdraw(_amount);
        _decreaseParentBalance(_amount);
    }

    function cashback(uint256 _amount) public override OnlyChildren(msg.sender) {
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

    function _increaseParentBalance(uint256 _amount) private {
        Children(parent).deposit(_amount);
    }

    function _decreaseParentBalance(uint256 _amount) private {
        Children(parent).withdraw(_amount);
    }

    function _decreaseParentInitialBalance(uint256 _amount) private onlyUnlockedPeriod(lockPeriod) {
        Children(parent).cashback(_amount);
    }
}
