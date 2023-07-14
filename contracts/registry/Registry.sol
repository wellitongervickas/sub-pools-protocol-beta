// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// struct Tokens {
//     IERC20 token1;
// }

import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryControl} from './RegistryControl.sol';
import {RegistryLib} from '../libraries/Registry.sol';

contract Registry is IRegistry, RegistryControl {
    RegistryLib.RegistryType public registryType;
    bytes public tokenData;

    constructor(RegistryLib.RegistryType _registryType, bytes memory _tokenData) {
        registryType = _registryType;
        tokenData = _tokenData;
    }
}
