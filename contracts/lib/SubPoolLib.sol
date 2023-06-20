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
     * @param _sender caller
     * @param _subPoolAddress address of the subpool node
     */
    function _checkIsNode(
        SubPool storage _self,
        address _sender,
        address _subPoolAddress
    ) internal view returns (bool) {
        return _sender == _subPoolAddress && _self.id > 0;
    }
}
