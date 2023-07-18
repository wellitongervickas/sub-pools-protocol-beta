// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterControl} from '../interfaces/router/IRouterControl.sol';
import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry} from '../registry/Registry.sol';
import {IStrategy, StrategyType} from '../interfaces/strategy/IStrategy.sol';

contract RouterControl is IRouterControl, NodeControl {
    mapping(address => bool) private _registries;

    modifier onlyValidRegistry(address _registryAddress) {
        _checkRegistry(_registryAddress);
        _;
    }

    function _checkRegistry(address _registryAddress) private view {
        if (!_registries[_registryAddress]) revert IRouterControl.NonRegistry();
    }

    function _createRegistry(address _strategyAddress) internal returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));

        emit IRouterControl.RegistryCreated(_registryAddress);

        _registries[_registryAddress] = true;

        return _registryAddress;
    }

    function _createRootNode(address _registryAddress, address[] memory _invitedAddresses) internal returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender, _invitedAddresses, _registryAddress);
        _setupNode(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function _deployNode(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) internal returns (address) {
        Node _node = new Node(_parentAddress, _managerAddress, _invitedAddresses, _registryAddress);
        address _nodeAddress = address(_node);

        emit IRouterControl.NodeCreated(_nodeAddress);

        return _nodeAddress;
    }

    function _setupRegistryAccount(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        Registry _registry = Registry(_registryAddress);

        _computeRegistrySetup(_registry, _nodeAddress);
        _computeRegistryDeposit(_registry, _nodeAddress, _amount);

        emit IRouterControl.RegistryJoined(_registryAddress, _nodeAddress, _amount);
    }

    function _computeRegistrySetup(Registry _registry, address _nodeAddress) private {
        _registry.setupAccount(_nodeAddress);
    }

    function _computeRegistryDeposit(Registry _registry, address _nodeAddress, bytes memory _amount) private {
        _registry.deposit(msg.sender, _nodeAddress, _amount);
    }
}
