// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);
    event Deposited(address indexed _accountAddress, bytes _amount);

    error AlreadyJoined();

    function setupAccount(address _accountAddress) external;

    function depositAccount(address _accountAddress, bytes memory _amount) external;
}
