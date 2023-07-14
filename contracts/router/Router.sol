// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {Node, INode} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry, IRegistry} from '../registry/Registry.sol';

contract Router is IRouter, NodeControl {
    constructor() {}

    function registryAndCreate(
        IRegistry.RegistryType _registryType,
        bytes memory _tokenData,
        address[] memory _invitedAddresses
    ) external returns (address) {
        address _registryAddress = _registry(_registryType, _tokenData);
        address _nodeAddress = _create(_invitedAddresses, _registryAddress);

        return _nodeAddress;
    }

    function _registry(IRegistry.RegistryType _registryType, bytes memory _tokenData) private returns (address) {
        address _registryAddress = address(new Registry(_registryType, _tokenData));
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

    function registryAndJoin(address _parentAddress, address[] memory _invitedAddresses) external returns (address) {
        INode _parent = INode(_parentAddress);
        address _nodeAddress = _join(_parent, _invitedAddresses, _parent.registry());

        return _nodeAddress;
    }

    function _join(
        INode _parent,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) private returns (address) {
        address _nodeAddress = _deployNode(address(_parent), msg.sender, _invitedAddresses, _registryAddress);
        _parent.join(_nodeAddress, msg.sender);

        return _nodeAddress;
    }
}
