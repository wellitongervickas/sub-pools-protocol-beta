// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';
import './lib/SubPool.sol';

contract SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public currentID;

    mapping(address => SubPoolLib.SubPool) public subPools;

    error NotAllowed();
    error LockPeriod();

    modifier onlyUnlockedPeriod(uint256 _lockPeriod) {
        if (_lockPeriod > block.timestamp) revert LockPeriod();
        _;
    }

    modifier onlySubNode(address _address) {
        bool _isNode = subPools[_address]._validateIsNode();
        if (!_isNode) revert NotAllowed();
        _;
    }

    function _computeNodeID() internal returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function _setupNode(address _subPoolAddress, address _managerAddress, uint256 _amount) internal returns (uint256) {
        uint256 _id = _computeNodeID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: _managerAddress,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        return _id;
    }

    /// @notice deposit to balance of node
    /// @param _amount the amount to deposit
    function deposit(uint256 _amount) public virtual {
        _increaseNodeBalance(msg.sender, _amount);
    }

    /// @notice decrease from balance of node
    /// @param _amount the amount to withdraw
    function withdraw(uint256 _amount) public virtual {
        _decreaseNodeBalance(msg.sender, _amount);
    }

    /// @notice decrease from initial balance of node
    /// @param _amount the amount to cashback
    function cashback(uint256 _amount) public virtual {
        _decreaseNodeInitialBalance(msg.sender, _amount);
    }

    /// @notice increase to balance of node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount to deposit
    function _increaseNodeBalance(address _nodeAddress, uint256 _amount) internal {
        subPools[_nodeAddress]._increaseBalance(_amount);
    }

    /// @notice decrease from balance of node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount to withdraw
    function _decreaseNodeBalance(address _nodeAddress, uint256 _amount) internal {
        subPools[_nodeAddress]._decreaseBalance(_amount);
    }

    /// @notice decrease from initial balance of node
    /// @param _nodeAddess the address of the node
    /// @param _amount the amount to decrease
    function _decreaseNodeInitialBalance(address _nodeAddess, uint256 _amount) internal virtual {
        subPools[_nodeAddess]._decreaseInitialBalance(_amount);
    }
}
