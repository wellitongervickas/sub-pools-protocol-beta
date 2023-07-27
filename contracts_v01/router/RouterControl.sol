// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterControl} from '../interfaces/router/IRouterControl.sol';
import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry} from '../registry/Registry.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {FractionLib} from '../libraries/Fraction.sol';

contract RouterControl is IRouterControl, NodeControl {
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
}
