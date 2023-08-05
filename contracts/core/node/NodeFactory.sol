// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {Node} from './Node.sol';

contract NodeFactory is INodeFactory {
    function build(
        address nodeManagerAddress_,
        address[] memory invitedAddresses_,
        address nodeParentAddress_
    ) public returns (address) {
        Node node = new Node(nodeManagerAddress_, invitedAddresses_, nodeParentAddress_);

        _setDeployerAsOwner(node, msg.sender);

        address nodeAddress = address(node);

        emit INodeFactory.NodeFactory_NodeCreated(nodeAddress, invitedAddresses_, nodeParentAddress_);

        return nodeAddress;
    }

    function _setDeployerAsOwner(Node node_, address deployerAddress_) private {
        node_.transferOwnership(deployerAddress_);
    }
}
