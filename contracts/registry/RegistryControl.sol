// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/utils/Counters.sol';
import {IRegistryControl} from '../interfaces/registry/IRegistryControl.sol';
import {RegistryLib} from '../libraries/Registry.sol';

contract RegistryControl is IRegistryControl {
    using RegistryLib for RegistryLib.Account;
    using Counters for Counters.Counter;

    Counters.Counter private currentID;

    mapping(address => RegistryLib.Account) private _accounts;

    function _setupAccount(address _accountAddress) internal {
        uint256 _id = _createID();
        _accounts[_accountAddress] = RegistryLib.Account({id: _id, initialBalance: abi.encode(0, ['uint256'])});
    }

    function _createID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function accounts(address _accountAddress) public view returns (RegistryLib.Account memory) {
        return _accounts[_accountAddress];
    }

    function _deposit(address _accountAddress, bytes memory _amount) internal {
        _accounts[_accountAddress]._deposit(_amount);
    }
}
