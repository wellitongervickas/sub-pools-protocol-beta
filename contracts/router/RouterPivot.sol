// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterPivot} from '../interfaces/router/IRouterPivot.sol';
import {Registry, IRegistry} from '../registry/Registry.sol';
import {FractionLib} from '../libraries/Fraction.sol';

contract RouterPivot is IRouterPivot {
    mapping(address => bool) public registries;

    modifier onlyValidRegistry(address _registryAddress) {
        _checkRegistry(_registryAddress);
        _;
    }

    function _checkRegistry(address _registryAddress) private view {
        if (!registries[_registryAddress]) revert IRouterPivot.NonRegistry();
    }

    function _createRegistry(
        address _strategyAddress,
        address _managerAddress,
        address _treasuryAddress
    ) internal returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress, _managerAddress, _treasuryAddress));

        emit IRouterPivot.RegistryCreated(_registryAddress);

        registries[_registryAddress] = true;
        return _registryAddress;
    }

    function _setupAccount(
        address _parentAddress,
        address _registryAddress,
        address _nodeAddress,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) internal {
        IRegistry(_registryAddress).join(
            _parentAddress,
            _nodeAddress,
            _fees,
            _requiredInitialDeposit,
            _maxDeposit,
            _lockPeriod
        );

        IRegistry(_registryAddress).deposit(msg.sender, _nodeAddress, _initialAmount);
        emit IRouterPivot.RegistryJoined(_registryAddress, _nodeAddress, _initialAmount);

        registries[_registryAddress] = false;
    }

    function _additionalDeposit(address _registryAddress, address _nodeAddress, bytes memory _initialAmount) internal {
        IRegistry(_registryAddress).additionalDeposit(msg.sender, _nodeAddress, _initialAmount);
        emit RegistryDeposited(_registryAddress, _nodeAddress, _initialAmount);
    }

    function _withdraw(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        IRegistry(_registryAddress).withdraw(msg.sender, _nodeAddress, _amount);
        emit RegistryWithdrew(_registryAddress, _nodeAddress, _amount);
    }

    function _withdrawInitialBalance(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        IRegistry(_registryAddress).withdrawInitialBalance(msg.sender, _nodeAddress, _amount);
        emit RegistryWithdrew(_registryAddress, _nodeAddress, _amount);
    }
}
