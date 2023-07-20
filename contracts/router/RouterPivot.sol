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
        Registry(_registryAddress).join(
            _parentAddress,
            _nodeAddress,
            _fees,
            _requiredInitialDeposit,
            _maxDeposit,
            _lockPeriod
        );

        Registry(_registryAddress).deposit(msg.sender, _nodeAddress, _initialAmount);
        emit IRouterPivot.RegistryJoined(_registryAddress, _nodeAddress, _initialAmount);

        registries[_registryAddress] = false;
    }

    function _additionalDeposit(address _registryAddress, address _nodeAddress, bytes memory _initialAmount) internal {
        Registry(_registryAddress).additionalDeposit(msg.sender, _nodeAddress, _initialAmount);
        emit RegistryDeposited(_registryAddress, _nodeAddress, _initialAmount);
    }

    function _withdraw(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        Registry(_registryAddress).withdraw(msg.sender, _nodeAddress, _amount);
        emit RegistryWithdrew(_registryAddress, _nodeAddress, _amount);
    }

    function _withdrawInitialBalance(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        Registry(_registryAddress).withdrawInitialBalance(msg.sender, _nodeAddress, _amount);
        emit RegistryWithdrew(_registryAddress, _nodeAddress, _amount);
    }
}
