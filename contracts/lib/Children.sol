// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library ChildrenLib {
    struct Children {
        address managerAddress;
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function _increaseBalance(Children storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    function _decreaseBalance(Children storage _self, uint256 _value) internal {
        _self.balance -= _value;
    }

    function _decreaseInitialBalance(Children storage _self, uint256 _value) internal {
        _self.initialBalance -= _value;
    }

    /// @notice zero is not registered
    function _validateIsChildren(Children storage _self) internal view returns (bool) {
        return _self.id > 0;
    }
}
