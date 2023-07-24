// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';
import {FractionLib} from '../../libraries/Fraction.sol';

interface IRouter {
    function registry(address _strategyAddress) external returns (address);

    function create(
        address _strategyAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) external returns (address);

    function join(
        address _parentAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) external returns (address);

    function additionalDeposit(address _nodeAddress, bytes memory _additionalAmount) external;

    function withdraw(address _nodeAddress, bytes memory _amount) external;

    function withdrawInitialBalance(address _nodeAddress, bytes memory _amount) external;
}
