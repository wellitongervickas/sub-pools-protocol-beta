// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

abstract contract SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public currentID;

    mapping(address => SubPoolLib.SubPool) public subPools;

    error NotAllowed();

    /**
     * @dev Update the current ID.
     * @return new current ID
     */
    function _updateCurrentID() internal returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    /**
     * @dev Deposit to a subpool node
     * @param _amount amount to deposit
     */
    function deposit(uint256 _amount) public virtual {
        SubPoolLib.SubPool storage _subPool = subPools[msg.sender];

        bool _isNode = _subPool._checkIsNode();
        if (!_isNode) revert NotAllowed();

        _setSubPoolBalance(_subPool, _amount);
    }

    /**
     * @dev Updated subpool node balance
     * @param _subPool subpool instance
     * @param _amount amount of balance to set
     */
    function _setSubPoolBalance(SubPoolLib.SubPool storage _subPool, uint256 _amount) internal {
        _subPool._setBalance(_amount);
    }
}
