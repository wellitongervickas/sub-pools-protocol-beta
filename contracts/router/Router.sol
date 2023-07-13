// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';

import {Node, INode} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';

contract Router is IRouter, NodeControl {
    function create(address[] memory _invitedAddresses) external returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender, _invitedAddresses);
        _setupNode(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function join(address _parentAddress, address[] memory _invitedAddresses) external returns (address) {
        INode _parent = INode(_parentAddress);

        address _nodeAddress = _deployNode(_parentAddress, msg.sender, _invitedAddresses);
        _parent.join(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function _deployNode(
        address _parentAddress,
        address _nodeOwnerAddress,
        address[] memory _invitedAddresses
    ) private returns (address) {
        Node _node = new Node(_parentAddress, _nodeOwnerAddress, _invitedAddresses);

        address _nodeAddress = address(_node);

        emit IRouter.NodeCreated(_nodeAddress);

        return _nodeAddress;
    }
}
