// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry} from '../registry/Registry.sol';

contract Router is IRouter, NodeControl {
    function registryAndCreate(
        address _strategyAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address) {
        address _registryAddress = _registry(_strategyAddress);
        address _nodeAddress = _createRootNode(_invitedAddresses, _registryAddress);

        Registry(_registryAddress).join(_nodeAddress);
        Registry(_registryAddress).deposit(_nodeAddress, _amount);

        return _nodeAddress;
    }

    function _registry(address _strategyAddress) private returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));
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

        Registry(_parentRegistry).join(_nodeAddress);
        Registry(_parentRegistry).deposit(_nodeAddress, _amount);

        return _nodeAddress;
    }
}
