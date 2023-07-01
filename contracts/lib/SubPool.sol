// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

library SubPoolLib {
    struct SubPool {
        address managerAddress;
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function _increaseBalance(SubPool storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    function _decreaseBalance(SubPool storage _self, uint256 _value) internal {
        _self.balance -= _value;
    }

    function _decreaseInitialBalance(SubPool storage _self, uint256 _value) internal {
        _self.initialBalance -= _value;
    }

    /// @notice zero is not registered
    function _validateIsNode(SubPool storage _self) internal view returns (bool) {
        return _self.id > 0;
    }
}
