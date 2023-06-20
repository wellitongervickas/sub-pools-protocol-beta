// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import './Fraction.sol';

library SubPoolLib {
    struct SubPool {
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    /**
     * @dev set subpool balance
     * @param _self subpool itself
     * @param _amount amount to set
     */
    function _setBalance(SubPool storage _self, uint256 _amount) internal {
        _self.balance += _amount;
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
