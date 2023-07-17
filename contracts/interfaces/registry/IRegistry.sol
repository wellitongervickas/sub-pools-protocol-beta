// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);

    error AlreadyJoined();

    function joinAndDeposit(address _accountAddress, bytes memory _amount) external;
}
