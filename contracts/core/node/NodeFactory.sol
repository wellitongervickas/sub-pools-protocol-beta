// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Node} from './Node.sol';

contract NodeFactory {
    event NodeFactory_NodeCreated(address indexed _nodeAddress);

    function build(address _managerAddress, address[] memory _invitedAddresses) public returns (address) {
        Node _node = new Node(_managerAddress, _invitedAddresses);

        _node.transferOwnership(msg.sender);

        emit NodeFactory_NodeCreated(address(_node));

        return address(_node);
    }
}
