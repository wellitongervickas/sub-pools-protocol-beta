// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry} from '../registry/Registry.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Router is IRouter, NodeControl {
    using SafeERC20 for IERC20;

    function registryAndCreate(
        address _strategyAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address) {
        address _registryAddress = _createRegistry(_strategyAddress);
        address _nodeAddress = _createRootNode(_invitedAddresses, _registryAddress);

        _setupRegistryAccount(_registryAddress, _nodeAddress, _amount);

        return _nodeAddress;
    }

    function _createRegistry(address _strategyAddress) private returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));

        emit IRouter.RegistryCreated(_registryAddress);

        return _registryAddress;
    }

    function _createRootNode(address[] memory _invitedAddresses, address _registryAddress) private returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender, _invitedAddresses, _registryAddress);
        _setupNode(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function _deployNode(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) private returns (address) {
        Node _node = new Node(_parentAddress, _managerAddress, _invitedAddresses, _registryAddress);
        address _nodeAddress = address(_node);

        emit IRouter.NodeCreated(_nodeAddress);
        return _nodeAddress;
    }

    function join(
        address _parentAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address) {
        Node _parent = Node(_parentAddress);

        address _parentRegistry = _parent.registry();
        address _nodeAddress = _deployNode(address(_parent), msg.sender, _invitedAddresses, _parentRegistry);

        _parent.join(_nodeAddress, msg.sender);
        _setupRegistryAccount(_parentRegistry, _nodeAddress, _amount);

        return _nodeAddress;
    }

    function _setupRegistryAccount(address _registryAddress, address _nodeAddress, bytes memory _amount) private {
        Registry _registry = Registry(_registryAddress);

        _computeRegistrySetup(_registry, _nodeAddress);
        _computeRegistryTransfer(_registry, _amount);
        _computeRegistryDeposit(_registry, _nodeAddress, _amount);

        emit IRouter.RegistryJoined(_registryAddress, _nodeAddress, _amount);
    }

    function _computeRegistrySetup(Registry _registry, address _nodeAddress) private {
        _registry.setupAccount(_nodeAddress);
    }

    function _computeRegistryTransfer(Registry _registry, bytes memory _amount) private {
        IStrategy _strategy = _registry.strategy(); // get in registry where will abstract the getter

        address _decodedTokenAddress = abi.decode(_strategy.token(), (address));
        uint256 _decodedAmount = abi.decode(_amount, (uint256));

        IERC20(_decodedTokenAddress).safeTransferFrom(msg.sender, address(_registry), _decodedAmount);
    }

    function _computeRegistryDeposit(Registry _registry, address _nodeAddress, bytes memory _amount) private {
        _registry.deposit(_nodeAddress, _amount);
    }
}
