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
        bytes cashbackBalance;
        bytes maxDeposit;
        uint256 lockPeriod;
    }

    function _setInitialBalance(Account storage _account, bytes memory _amount) internal {
        _account.initialBalance = _amount;
    }

    function _setAdditionalBalance(Account storage _account, bytes memory _amount) internal {
        _account.additionalBalance = _amount;
    }

    function _setCashbackBalance(Account storage _account, bytes memory _amount) internal {
        _account.cashbackBalance = _amount;
    }

    function _isLocked(Account storage _account) internal view returns (bool) {
        return _account.lockPeriod > block.timestamp;
    }
}
