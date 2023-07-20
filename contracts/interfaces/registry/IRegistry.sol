// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from '../../libraries/Fraction.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);
    event Deposited(address indexed _accountAddress, bytes _amount);
    event Withdrew(address indexed _accountAddress, bytes _amount);

    error AlreadyJoined();
    error InvalidInitialAmount();
    error ExceedsMaxDeposit();
    error InsufficientAdditionalBalance();

    function join(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit
    ) external;

    function deposit(address _from, address _accountAddress, bytes memory _amount) external;

    function additionalDeposit(address _from, address _accountAddress, bytes memory _amount) external;

    function withdraw(address _from, address _accountAddress, bytes memory _amount) external;
}
