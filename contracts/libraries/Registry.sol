// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library RegistryLib {
    struct Account {
        uint256 id;
        bytes initialBalance;
        // bytes additionalBalance;
        /// JOIN FEES RATIO
        /// REQUIRED INITIAL AMOUNT
        /// LOCK PERIOD
        /// MAX DEPOSIT
    }

    function _deposit(Account storage _account, bytes memory _amount) internal {
        _account.initialBalance = _amount;
    }
}
