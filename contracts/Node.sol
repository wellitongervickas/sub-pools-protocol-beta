// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {INode} from './interfaces/INode.sol';
import {NodeLib} from './lib/Node.sol';

contract Node is INode {
    using NodeLib for NodeLib.Node;
    using Counters for Counters.Counter;

    Counters.Counter public currentID;
    mapping(address => NodeLib.Node) private _children;

    modifier onlyUnlockedPeriod(uint256 _lockPeriod) {
        if (_lockPeriod > block.timestamp) revert INode.LockPeriod();
        _;
    }

    modifier OnlyChildren(address _childrenAddress) {
        bool isChildren = _children[_childrenAddress]._validateIsNode();
        if (!isChildren) revert INode.NotAllowed();
        _;
    }

    function children(address _childrenAddress) public view override returns (NodeLib.Node memory) {
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

        _children[_childrenAddress] = NodeLib.Node({
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

    function _decreaseChildrenBalance(address _childrenAddress, uint256 _amount) internal {
        _children[_childrenAddress]._decreaseBalance(_amount);
    }

    function _decreaseChildrenInitialBalance(address _childrenAddress, uint256 _amount) internal virtual {
        _children[_childrenAddress]._decreaseInitialBalance(_amount);
    }
}
