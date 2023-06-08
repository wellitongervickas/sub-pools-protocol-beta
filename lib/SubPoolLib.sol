// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library SubPoolLib {
    struct SubPoolInfo {
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }

    function initialDeposit(SubPoolInfo storage self, uint256 _amount) internal {
        self.initialBalance = _amount;
    }

    function additionalDeposit(SubPoolInfo storage self, uint256 _amount) internal {
        self.balance += _amount;
    }

    function checkSenderIsNode(SubPoolInfo storage self, address sender, address _subPoolAddress) internal view returns (bool) {
        return sender == _subPoolAddress && self.id > 0;
    }
}
