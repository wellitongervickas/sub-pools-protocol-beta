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
        _checkIsNode(msg.sender);
        _setSubPoolBalance(msg.sender, _amount);
    }

    function _checkIsNode(address _address) internal view {
        bool _isNode = subPools[_address]._checkIsNode();
        if (!_isNode) revert NotAllowed();
    }

    /**
     * @dev Updated subpool node balance
     * @param _address subpool address
     * @param _amount amount of balance to set
     */
    function _setSubPoolBalance(address _address, uint256 _amount) internal {
        subPools[_address]._setBalance(_amount);
    }

    /**
     * @dev update subpool node balance
     * @param _subPoolAddress address of the subpool node
     * @param _amount additional amount deposited by manager of node
     */
    function additionalDeposit(address _subPoolAddress, uint256 _amount) public virtual {
        _checkIsNode(_subPoolAddress);
        _setSubPoolBalance(_subPoolAddress, _amount);
    }
}
