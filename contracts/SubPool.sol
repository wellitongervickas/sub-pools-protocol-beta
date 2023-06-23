// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

import 'hardhat/console.sol';

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

    function deposit(uint256 _amount) public virtual {
        _increaseSubPoolBalance(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) public virtual {
        _decreaseSubPoolBalance(msg.sender, _amount);
    }

    function _checkIsNode(address _address) internal view {
        bool _isNode = subPools[_address]._checkIsNode();
        if (!_isNode) revert NotAllowed();
    }

    function _increaseSubPoolBalance(address _address, uint256 _amount) internal {
        _checkIsNode(_address);
        subPools[_address]._increaseBalance(_amount);
    }

    function _decreaseSubPoolBalance(address _address, uint256 _amount) internal {
        _checkIsNode(_address);
        subPools[_address]._decreaseBalance(_amount);
    }
}
