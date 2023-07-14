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
        uint256 _childrenID = _createChildrenID();
        _accounts[_accountAddress] = RegistryLib.Account({id: _childrenID, initialBalance: 0});
    }

    function _createChildrenID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function accounts(address _accountAddress) public view returns (RegistryLib.Account memory) {
        return _accounts[_accountAddress];
    }
}
