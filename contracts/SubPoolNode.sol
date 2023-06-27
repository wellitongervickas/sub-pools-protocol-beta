// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './SubPool.sol';
import './SubPoolManager.sol';
import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

contract SubPoolNode is SubPool, SubPoolManager, Ownable {
    using SafeMath for uint256;

    address public parent;
    uint public lockPeriod = 0;

    error ParentNotFound();
    error ParentAlreadySet();

    constructor(
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint _lockPeriod
    ) SubPoolManager(_managerAddress, _amount, _fees) {
        _grantInitialInvites(_invitedAddresses);
        _setLockPeriod(_lockPeriod);
    }

    function _setLockPeriod(uint _lockPeriod) internal {
        lockPeriod = _lockPeriod;
    }

    function setParent(address _parent) external onlyOwner {
        if (_checkHasParent()) revert ParentAlreadySet();
        parent = _parent;
    }

    function _checkHasParent() internal view returns (bool) {
        return parent != address(0);
    }

    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (!_checkHasParent()) revert ParentNotFound();
        if (!checkIsInvitedRole(tx.origin)) revert SubPoolManager.NotInvited();

        uint256 _amountSubTotal = _computeManagerFees(_amount);
        uint256 _id = _setupNode(_subPoolAddress, msg.sender, _amountSubTotal);

        _updateManagerRole(tx.origin);
        _increaseParentBalance(_amount);

        return _id;
    }

    function _increaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).deposit(_amount);
    }

    function _decreaseParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).withdraw(_amount);
    }

    function _decreaseParentInitialBalance(uint256 _amount) internal {
        SubPoolNode(parent).cashback(_amount);
    }

    function deposit(uint256 _amount) public override {
        super.deposit(_amount);
        _increaseParentBalance(_amount);
    }

    function withdraw(uint256 _amount) public override {
        super.withdraw(_amount);
        _decreaseParentBalance(_amount);
    }

    function cashback(uint256 _amount) public override {
        super.cashback(_amount);
        _decreaseParentInitialBalance(_amount);
    }

    function additionalDeposit(uint256 _amount) external onlyOwner {
        _increaseManagerBalance(_amount);
        _increaseParentBalance(_amount);
    }

    function withdrawBalance(uint256 _amount) external onlyOwner {
        _decreaseManagerBalance(_amount);
        _decreaseParentBalance(_amount);
    }

    function withdrawInitialBalance(uint256 _amount) external onlyOwner {
        _decreaseManagerInitialBalance(_amount);
        _decreaseParentInitialBalance(_amount);
    }
}
