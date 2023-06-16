// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import '../lib/SubPoolLib.sol';
import '../lib/ManagerLib.sol';

abstract contract SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public nextSubPoolID;

    mapping(address => SubPoolLib.SubPool) public subPools;

    event SubPoolDeposited(address indexed _subPoolAddress, uint256 _amount);

    error NodeNotAllowed();

    function _updateCurrentSubPoolID() internal returns (uint256) {
        nextSubPoolID.increment();
        return nextSubPoolID.current();
    }

    function _deposit(address _sender, address _subPoolAddress, uint256 _amount) internal {
        SubPoolLib.SubPool storage _subPool = subPools[_subPoolAddress];

        bool _isNode = _subPool._checkIsNode(_sender, _subPoolAddress);
        if (!_isNode) revert NodeNotAllowed();

        _setSubPoolBalance(_subPool, _amount);
    }

    function _setSubPoolBalance(SubPoolLib.SubPool storage _subPool, uint256 _amount) internal {
        _subPool._setBalance(_amount);
    }
}
