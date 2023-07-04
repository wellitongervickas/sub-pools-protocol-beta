// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {ISubPool} from './interfaces/ISubPool.sol';
import {SubPoolLib} from './lib/SubPool.sol';

contract SubPool is ISubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public currentID;
    mapping(address => SubPoolLib.SubPool) private _subPools;

    /// @dev check is unlocked
    modifier onlyUnlockedPeriod(uint256 _lockPeriod) {
        if (_lockPeriod > block.timestamp) revert ISubPool.LockPeriod();
        _;
    }

    /// @dev check if address is a valid node
    modifier OnlyNode(address _nodeAddress) {
        bool _isNode = _subPools[_nodeAddress]._validateIsNode();
        if (!_isNode) revert ISubPool.NotAllowed();
        _;
    }

    /// @inheritdoc ISubPool
    function subPools(address _address) public view override returns (SubPoolLib.SubPool memory) {
        return _subPools[_address];
    }

    /// @notice compute the node id and update the current ID
    /// @return the current ID
    function _computeNodeID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    /// @notice setup a new node in nodes context
    /// @param _nodeAddress the address of the node
    /// @param _managerAddress the address of the manager
    /// @param _amount the amount of the node as initial balance
    /// @return the id of the node
    function _setupNode(address _nodeAddress, address _managerAddress, uint256 _amount) internal returns (uint256) {
        uint256 _id = _computeNodeID();

        _subPools[_nodeAddress] = SubPoolLib.SubPool({
            managerAddress: _managerAddress,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        return _id;
    }

    /// @inheritdoc ISubPool
    function deposit(uint256 _amount) public virtual {
        _increaseNodeBalance(msg.sender, _amount);
    }

    /// @inheritdoc ISubPool
    function withdraw(uint256 _amount) public virtual {
        _decreaseNodeBalance(msg.sender, _amount);
    }

    /// @inheritdoc ISubPool
    function cashback(uint256 _amount) public virtual {
        _decreaseNodeInitialBalance(msg.sender, _amount);
    }

    /// @notice increase to balance of node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount to deposit
    function _increaseNodeBalance(address _nodeAddress, uint256 _amount) internal {
        _subPools[_nodeAddress]._increaseBalance(_amount);
    }

    /// @notice decrease from balance of node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount to withdraw
    function _decreaseNodeBalance(address _nodeAddress, uint256 _amount) internal {
        _subPools[_nodeAddress]._decreaseBalance(_amount);
    }

    /// @notice decrease from initial balance of node
    /// @param _nodeAddess the address of the node
    /// @param _amount the amount to decrease
    function _decreaseNodeInitialBalance(address _nodeAddess, uint256 _amount) internal virtual {
        _subPools[_nodeAddess]._decreaseInitialBalance(_amount);
    }
}
