// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterPivot} from '../interfaces/router/IRouterPivot.sol';
import {Registry} from '../registry/Registry.sol';
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

    function _createRegistry(address _strategyAddress) internal returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));

        emit IRouterPivot.RegistryCreated(_registryAddress);

        registries[_registryAddress] = true;

        return _registryAddress;
    }

    function _setupRegistryAccount(
        address _parentAddress,
        address _registryAddress,
        address _nodeAddress,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) internal {
        Registry _registry = Registry(_registryAddress);

        _registrySetupAccount(_parentAddress, _registry, _nodeAddress, _fees, _requiredInitialDeposit);
        _registryDepositAccount(_registry, _nodeAddress, _initialAmount);

        emit IRouterPivot.RegistryJoined(_registryAddress, _nodeAddress, _initialAmount);

        registries[_registryAddress] = false;
    }

    function _registrySetupAccount(
        address _parentAddress,
        Registry _registry,
        address _nodeAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) private {
        _registry.setupAccount(_parentAddress, _nodeAddress, _fees, _requiredInitialDeposit);
    }

    function _registryDepositAccount(Registry _registry, address _nodeAddress, bytes memory _initialAmount) private {
        _registry.deposit(msg.sender, _nodeAddress, _initialAmount);
    }
}
