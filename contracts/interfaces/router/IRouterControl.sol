// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IRouterControl {
    event NodeCreated(address indexed _nodeAddress);
    event RegistryCreated(address indexed _registryAddress);
    event RegistryJoined(address indexed _registryAddress, address indexed _nodeAddress, bytes _amount);

    error NonRegistry();
}
