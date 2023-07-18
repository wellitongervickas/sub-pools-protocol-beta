// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';
import {FractionLib} from '../../libraries/Fraction.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);
    event Deposited(address indexed _accountAddress, bytes _amount);

    error AlreadyJoined();

    function setupAccount(address _accountAddress, FractionLib.Fraction memory _fees) external;

    function deposit(address _from, address _accountAddress, bytes memory _amount) external;
}
