// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';

contract Router is NodeControl {
    event NodeCreated(address indexed node);

    function create() external returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender);
        _setupNode(_nodeAddress, msg.sender);

        emit NodeCreated(_nodeAddress);
        return _nodeAddress;
    }

    function join(address _parentAddress) external returns (address) {
        Node _parent = Node(_parentAddress);

        address _nodeAddress = _deployNode(_parentAddress, msg.sender);
        _parent.join(_nodeAddress, msg.sender);

        emit NodeCreated(_nodeAddress);
        return _nodeAddress;
    }

    function _deployNode(address _parentAddress, address _managerAddress) private returns (address) {
        Node _node = new Node(_parentAddress, _managerAddress);
        return address(_node);
    }
}
