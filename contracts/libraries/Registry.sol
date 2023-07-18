// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from './Fraction.sol';

library RegistryLib {
    struct Account {
        uint256 id;
        bytes initialBalance;
        bytes additionalBalance;
        FractionLib.Fraction fees;
        /// JOIN FEES RATIO
        /// CHILD REQUIRED INITIAL AMOUNT
        /// NODE LOCK PERIOD
        /// CHILD MAX DEPOSIT
    }

    function _deposit(Account storage _account, bytes memory _amount) internal {
        _account.initialBalance = _amount;
    }
}
