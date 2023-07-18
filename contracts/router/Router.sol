// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterControl} from './RouterControl.sol';
import {Node} from '../node/Node.sol';

contract Router is IRouter, RouterControl {
    function registry(address _strategyAddress) external returns (address) {
        return _createRegistry(_strategyAddress);
    }

    function create(
        address _registryAddress,
        address[] memory _invitedAddresses,
        bytes memory _amount
    ) external returns (address) {
        address _nodeAddress = _createRootNode(_invitedAddresses, _registryAddress);

        _setupRegistryAccount(_registryAddress, _nodeAddress, _amount);
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
}
