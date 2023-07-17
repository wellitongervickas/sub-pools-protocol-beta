// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRouter {
    event NodeCreated(address indexed _nodeAddress);
    event RegistryCreated(address indexed _registryAddress);
    event RegistryJoined(address indexed _registryAddress, address indexed _nodeAddress, bytes _amount);

    function registryAndCreate(
        address _strategyAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address);

    function join(
        address _parentAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address);
}
