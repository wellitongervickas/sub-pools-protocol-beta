// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {IChildrenControl} from './interfaces/IChildrenControl.sol';
import {ChildrenLib} from './lib/Children.sol';

contract ChildrenControl is IChildrenControl {
    using ChildrenLib for ChildrenLib.Children;
    using Counters for Counters.Counter;

    Counters.Counter private currentID;
    mapping(address => ChildrenLib.Children) private _children;

    modifier onlyUnlockedPeriod(uint256 _lockPeriod) {
        if (_lockPeriod > block.timestamp) revert IChildrenControl.LockPeriod();
        _;
    }

    modifier onlyChildren(address _childrenAddress) {
        bool isChildren = _children[_childrenAddress]._validateIsChildren();
        if (!isChildren) revert IChildrenControl.NotAllowed();
        _;
    }

    modifier checkOverflow(uint256 _value, uint256 _amount) {
        bool _isGreaterThanOrEqualToAmount = _value >= _amount;
        if (!_isGreaterThanOrEqualToAmount) revert IChildrenControl.NotAllowed();
        _;
    }

    function children(address _childrenAddress) public view override returns (ChildrenLib.Children memory) {
        return _children[_childrenAddress];
    }

    function _createChildrenID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function _setupChildren(
        address _childrenAddress,
        address _managerAddress,
        uint256 _amount
    ) internal returns (uint256) {
        uint256 _id = _createChildrenID();

        _children[_childrenAddress] = ChildrenLib.Children({
            managerAddress: _managerAddress,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        return _id;
    }

    function deposit(uint256 _amount) public virtual {
        _increaseChildrenBalance(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) public virtual {
        _decreaseChildrenBalance(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public virtual {
        _decreaseChildrenInitialBalance(msg.sender, _amount);
    }

    function _increaseChildrenBalance(address _childrenAddress, uint256 _amount) internal {
        _children[_childrenAddress]._increaseBalance(_amount);
    }

    function _decreaseChildrenBalance(
        address _childrenAddress,
        uint256 _amount
    ) internal checkOverflow(_children[_childrenAddress].balance, _amount) {
        _children[_childrenAddress]._decreaseBalance(_amount);
    }

    function _decreaseChildrenInitialBalance(
        address _childrenAddress,
        uint256 _amount
    ) internal virtual checkOverflow(_children[_childrenAddress].initialBalance, _amount) {
        _children[_childrenAddress]._decreaseInitialBalance(_amount);
    }
}
