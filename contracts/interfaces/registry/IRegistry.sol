// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);
    event Deposited(address indexed _accountAddress, bytes _amount);

    error AlreadyJoined();

    function join(address _accountAddress) external;
}
