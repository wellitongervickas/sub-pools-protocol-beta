// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRegistry {
    function registryType() external view returns (RegistryLib.RegistryType);

    function tokenData() external view returns (bytes memory);
}
