// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library RegistryLib {
    enum RegistryType {
        SingleTokenRegistry
    }

    struct Account {
        uint256 id;
        /// JOIN FEES RATIO
        /// REQUIRED INITIAL AMOUNT
        /// LOCK PERIOD
        /// MAX DEPOSIT
        /// CASHBACK
        /// BALANCE
    }
}
