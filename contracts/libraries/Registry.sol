// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from './Fraction.sol';

library RegistryLib {
    struct Account {
        uint256 id;
        bytes initialBalance;
        bytes additionalBalance;
        FractionLib.Fraction fees;
        address parent;
        /// NODE LOCK PERIOD
        /// CHILD REQUIRED INITIAL AMOUNT
        /// CHILD MAX DEPOSIT
    }

    function _deposit(Account storage _account, bytes memory _amount) internal {
        _account.initialBalance = _amount;
    }
}
