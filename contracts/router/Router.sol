// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {Node, INode} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry, RegistryLib, IRegistry} from '../registry/Registry.sol';

contract Router is IRouter, NodeControl {
    function registryAndCreate(
        address _strategyAddress,
        address[] memory _invitedAddresses
    ) external returns (address) {
        address _registryAddress = _registry(_strategyAddress);
        address _nodeAddress = _create(_invitedAddresses, _registryAddress);

        IRegistry(_registryAddress).join(_nodeAddress);

        return _nodeAddress;
    }

    function _registry(address _strategyAddress) private returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));
        return _registryAddress;
    }

    function _create(address[] memory _invitedAddresses, address _registryAddress) private returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender, _invitedAddresses, _registryAddress);
        _setupNode(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function _deployNode(
        address _parentAddress,
        address _nodeOwnerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) private returns (address) {
        Node _node = new Node(_parentAddress, _nodeOwnerAddress, _invitedAddresses, _registryAddress);
        address _nodeAddress = address(_node);

        emit IRouter.NodeCreated(_nodeAddress);
        return _nodeAddress;
    }

    function join(address _parentAddress, address[] memory _invitedAddresses) external returns (address) {
        INode _parent = INode(_parentAddress);
        address _parentRegistry = _parent.registry();
        address _nodeAddress = _joinParent(_parent, _invitedAddresses, _parentRegistry);

        IRegistry(_parentRegistry).join(_nodeAddress);

        return _nodeAddress;
    }

    function _joinParent(
        INode _parent,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) private returns (address) {
        address _nodeAddress = _deployNode(address(_parent), msg.sender, _invitedAddresses, _registryAddress);
        _parent.join(_nodeAddress, msg.sender);

        return _nodeAddress;
    }
}
