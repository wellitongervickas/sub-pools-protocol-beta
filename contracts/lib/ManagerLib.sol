// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import './Fraction.sol';

library ManagerLib {
    struct Manager {
        address managerAddress;
        uint256 initialBalance;
        uint256 balance;
        FractionLib.Fraction feesRatio;
    }
}
