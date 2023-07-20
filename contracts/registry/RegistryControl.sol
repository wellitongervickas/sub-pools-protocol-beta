// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {IRegistryControl} from '../interfaces/registry/IRegistryControl.sol';
import {RegistryLib} from '../libraries/Registry.sol';
import {FractionLib} from '../libraries/Fraction.sol';

contract RegistryControl is IRegistryControl {
    using RegistryLib for RegistryLib.Account;
    using Counters for Counters.Counter;

    Counters.Counter private currentID;

    mapping(address => RegistryLib.Account) public accounts;

    function _setupAccount(
        address _accountAddress,
        bytes memory _initialBalance,
        bytes memory _additionalBalance,
        FractionLib.Fraction memory _fees,
        address _parentAddress,
        bytes memory _requiredInitialAmount,
        bytes memory _initialCashbackBalance,
        bytes memory _maxDeposit
    ) internal {
        uint256 _id = _createID();

        accounts[_accountAddress] = RegistryLib.Account({
            id: _id,
            initialBalance: _initialBalance,
            additionalBalance: _additionalBalance,
            fees: _fees,
            parent: _parentAddress,
            requiredInitialDeposit: _requiredInitialAmount,
            cashbackBalance: _initialCashbackBalance,
            maxDeposit: _maxDeposit
        });
    }

    function _createID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function _depositAccount(address _accountAddress, bytes memory _amount) internal {
        accounts[_accountAddress]._deposit(_amount);
    }

    function _additionalDepositAccount(address _accountAddress, bytes memory _amount) internal {
        accounts[_accountAddress]._additionalDeposit(_amount);
    }

    function _setCashbackBalanceAccount(address _accountAddress, bytes memory _amount) internal {
        accounts[_accountAddress]._setCashbackBalance(_amount);
    }

    function _parentAccount(address _accountAddress) internal view returns (RegistryLib.Account storage) {
        return accounts[accounts[_accountAddress].parent];
    }

    function _account(address _accountAddress) internal view returns (RegistryLib.Account storage) {
        return accounts[_accountAddress];
    }
}
