// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRegistry} from '../registry/IRegistry.sol';

interface IRouter {
    event NodeCreated(address indexed _nodeAddress);

    function registryAndCreate(
        IRegistry.RegistryType _registryType,
        bytes memory _tokenData,
        address[] memory _invitedAddresses
    ) external returns (address);

    function registryAndJoin(address _parentAddress, address[] memory _invitedAddresses) external returns (address);
}
