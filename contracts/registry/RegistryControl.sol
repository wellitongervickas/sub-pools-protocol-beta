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
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees
    ) internal {
        uint256 _id = _createID();

        accounts[_accountAddress] = RegistryLib.Account({
            id: _id,
            initialBalance: abi.encode(0),
            additionalBalance: abi.encode(0),
            fees: _fees,
            parent: _parentAddress
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
}
