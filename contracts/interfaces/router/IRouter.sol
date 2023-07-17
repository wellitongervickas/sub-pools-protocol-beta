// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRouter {
    event NodeCreated(address indexed _nodeAddress);

    function registryAndCreate(address _strategyAddress, address[] memory _invitedAddresses) external returns (address);

    function join(address _parentAddress, address[] memory _invitedAddresses) external returns (address);
}
