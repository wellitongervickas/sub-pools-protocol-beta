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
        bytes requiredInitialDeposit;
        bytes cashbackBalance; /// CHILD CASHBACK TVL
        bytes maxDeposit;
        /// ToDo:
        /// LOCK PERIOD
        /// WITHDRAWS
    }

    function _deposit(Account storage _account, bytes memory _amount) internal {
        _account.initialBalance = _amount;
    }

    function _additionalDeposit(Account storage _account, bytes memory _amount) internal {
        _account.additionalBalance = _amount;
    }

    function _withdraw(Account storage _account, bytes memory _amount) internal {
        _account.additionalBalance = _amount;
    }

    function _setCashbackBalance(Account storage _account, bytes memory _amount) internal {
        _account.cashbackBalance = _amount;
    }

    function _calculateFees(Account storage _account, uint256 _amount) internal view returns (uint256) {
        uint256 _feesAmount = (_amount * _account.fees.value) / _account.fees.divider;
        return _feesAmount;
    }
}
