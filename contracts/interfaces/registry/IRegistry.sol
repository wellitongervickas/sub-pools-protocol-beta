// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from '../../libraries/Fraction.sol';

interface IRegistry {
    event Joined(address indexed _accountAddress);
    event Deposited(address indexed _accountAddress, bytes _amount);

    error AlreadyJoined();
    error InvalidInitialAmount();

    function join(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) external;

    function deposit(address _from, address _accountAddress, bytes memory _amount) external;

    function additionalDeposit(address _from, address _accountAddress, bytes memory _amount) external;
}
