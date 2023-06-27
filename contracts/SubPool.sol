// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';

import './lib/SubPoolLib.sol';

contract SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public currentID;

    mapping(address => SubPoolLib.SubPool) public subPools;

    error NotAllowed();

    function _updateCurrentID() internal returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function _setupNode(address _subPoolAddress, address _managerAddress, uint256 _amount) internal returns (uint256) {
        uint256 _id = _updateCurrentID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: _managerAddress,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        return _id;
    }

    function deposit(uint256 _amount) public virtual {
        _increaseSubPoolBalance(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) public virtual {
        _decreaseSubPoolBalance(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public virtual {
        _decreaseSubPoolInitialBalance(msg.sender, _amount);
    }

    function _increaseSubPoolBalance(address _address, uint256 _amount) internal {
        _validateIsNode(_address);
        subPools[_address]._increaseBalance(_amount);
    }

    function _decreaseSubPoolBalance(address _address, uint256 _amount) internal {
        _validateIsNode(_address);
        subPools[_address]._decreaseBalance(_amount);
    }

    function _decreaseSubPoolInitialBalance(address _address, uint256 _amount) internal {
        _validateIsNode(_address);
        subPools[_address]._decreaseInitialBalance(_amount);
    }

    function _validateIsNode(address _address) internal view {
        bool _isNode = subPools[_address]._validateIsNode();
        if (!_isNode) revert NotAllowed();
    }
}
