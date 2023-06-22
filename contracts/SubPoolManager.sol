// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './lib/ManagerLib.sol';

contract SubPoolManager {
    using ManagerLib for ManagerLib.Manager;
    using SafeMath for uint256;

    ManagerLib.Manager public manager;

    constructor(address _managerAddress, uint256 _amount, FractionLib.Fraction memory _fees) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            fees: _fees
        });
    }

    function _computeManagerFees(uint256 _amount) internal returns (uint256) {
        uint256 _managerAmount = manager._computeFees(_amount);
        _updateManagerBalance(_managerAmount);

        return _amount.sub(_managerAmount);
    }

    function _updateManagerBalance(uint256 _amount) internal {
        manager._updateBalance(_amount);
    }
}
