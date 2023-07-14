// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// struct Tokens {
//     IERC20 token1;
// }

import {IRegistry} from '../interfaces/registry/IRegistry.sol';

contract Registry is IRegistry {
    IRegistry.RegistryType public registryType;
    bytes public tokenData;

    constructor(IRegistry.RegistryType _registryType, bytes memory _tokenData) {
        registryType = _registryType;
        tokenData = _tokenData;
    }
}
