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

    mapping(address => RegistryLib.Account) private _accounts;

    function _setupAccount(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees
    ) internal {
        uint256 _id = _createID();
        _accounts[_accountAddress] = RegistryLib.Account({
            id: _id,
            initialBalance: '',
            additionalBalance: '',
            fees: _fees,
            parent: _parentAddress
        });
    }

    function _createID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function accounts(address _accountAddress) public view returns (RegistryLib.Account memory) {
        return _accounts[_accountAddress];
    }

    function _depositAccount(address _accountAddress, bytes memory _amount) internal {
        _accounts[_accountAddress]._deposit(_amount);
    }
}
