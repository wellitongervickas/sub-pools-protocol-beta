// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// struct Tokens {
//     IERC20 token1;
// }

import {IRegistry, RegistryType} from '../interfaces/registry/IRegistry.sol';

contract Registry {
    RegistryType private registryType;

    constructor(RegistryType _registryType) {
        registryType = _registryType;
    }
}
