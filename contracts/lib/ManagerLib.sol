// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

library ManagerLib {
    struct Manager {
        address managerAddress;
        uint256 initialBalance;
        uint256 balance;
    }
}
