// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryType} from '../registry/IRegistry.sol';

interface IRouter {
    event NodeCreated(address indexed _nodeAddress);

    function registryAndCreate(
        RegistryType _registryType,
        address[] memory _invitedAddresses
    ) external returns (address);

    function registryAndJoin(
        address _parentAddress,
        RegistryType _registryType,
        address[] memory _invitedAddresses
    ) external returns (address);
}
