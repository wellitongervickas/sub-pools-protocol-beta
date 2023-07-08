// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library NodeLib {
    struct Node {
        address managerAddress;
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function _increaseBalance(Node storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    function _decreaseBalance(Node storage _self, uint256 _value) internal {
        _self.balance -= _value;
    }

    function _decreaseInitialBalance(Node storage _self, uint256 _value) internal {
        _self.initialBalance -= _value;
    }

    /// @notice zero is not registered
    function _validateIsNode(Node storage _self) internal view returns (bool) {
        return _self.id > 0;
    }
}
