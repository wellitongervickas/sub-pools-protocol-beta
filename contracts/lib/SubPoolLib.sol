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

    function _updateBalance(SubPool storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    function _checkIsNode(SubPool storage _self) internal view returns (bool) {
        return _self.id > 0;
    }
}
