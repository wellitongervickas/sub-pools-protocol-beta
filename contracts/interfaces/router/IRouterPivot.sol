// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IRouterPivot {
    event RegistryCreated(address indexed _registryAddress);
    event RegistryJoined(address indexed _registryAddress, address indexed _nodeAddress, bytes _amount);
    event RegistryDeposited(address indexed _registryAddress, address indexed _nodeAddress, bytes _amount);

    error NonRegistry();
}
