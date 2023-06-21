// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import './Fraction.sol';

library SubPoolLib {
    struct SubPool {
        address managerAddress;
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    /**
     * @dev set subpool balance
     * @param _self subpool itself
     * @param _value amount to set
     */
    function _setBalance(SubPool storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    /**
     * @dev Check if sender is node
     * @param _self subpool itself
     * @return is the sender a node
     */
    function _checkIsNode(SubPool storage _self) internal view returns (bool) {
        return _self.id > 0;
    }
}
