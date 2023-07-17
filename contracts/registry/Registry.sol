// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// struct Tokens {
//     IERC20 token1;
// }

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryControl} from './RegistryControl.sol';
import {RegistryLib} from '../libraries/Registry.sol';

contract Registry is IRegistry, RegistryControl, Ownable {
    RegistryLib.RegistryType public registryType;
    bytes public tokenData;

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier whenNotAccount(address _address) {
        if (accounts(_address).id != 0) revert AlreadyJoined();
        _;
    }

    constructor(RegistryLib.RegistryType _registryType, bytes memory _tokenData) {
        registryType = _registryType;
        tokenData = _tokenData;
        join(msg.sender);
    }

    function join(address _accountAddress) public onlyRouter whenNotAccount(_accountAddress) {
        _setupAccount(_accountAddress);
        emit Joined(_accountAddress);
    }
}
