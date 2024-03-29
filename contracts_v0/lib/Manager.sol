// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import {FractionLib} from './Fraction.sol';

library ManagerLib {
    using SafeMath for uint256;

    struct Manager {
        address managerAddress;
        uint256 initialBalance;
        uint256 balance;
        FractionLib.Fraction fees;
    }

    function _increaseBalance(Manager storage _self, uint256 _value) internal {
        _self.balance += _value;
    }

    function _decreaseBalance(Manager storage _self, uint256 _value) internal {
        _self.balance -= _value;
    }

    function _decreaseInitialBalance(Manager storage _self, uint256 _value) internal {
        _self.initialBalance -= _value;
    }

    /// @notice calculate the manager fees using the ratio
    function _calculateRatioFees(Manager storage _self, uint256 _value) internal view returns (uint256) {
        return _value.mul(_self.fees.value).div(_self.fees.divider);
    }
}
