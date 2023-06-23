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

    error ParentNotFound();
    error ParentAlreadySet();

    constructor(
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) SubPoolManager(_managerAddress, _amount, _fees) {
        _grantInitialInvites(_invitedAddresses);
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

        uint256 _id = _updateCurrentID();
        uint256 _amountSubTotal = _computeManagerFees(_amount);

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: tx.origin,
            id: _id,
            initialBalance: _amountSubTotal,
            balance: 0
        });

        _updateManagerRole(tx.origin);
        _increaseParentBalance(_amount);

        return subPools[_subPoolAddress].id;
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
