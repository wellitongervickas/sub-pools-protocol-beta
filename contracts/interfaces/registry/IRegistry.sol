// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IRegistry {
    enum RegistryType {
        SingleTokenRegistry
    }

    function registryType() external view returns (RegistryType);

    function tokenData() external view returns (bytes memory);
}
