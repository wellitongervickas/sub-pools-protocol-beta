// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {Node} from './Node.sol';

/**
 * @title
 * @author
 * @notice
 */

/// ToDo: only deployer can build
contract NodeFactory is INodeFactory {
    /// @inheritdoc INodeFactory
    function build(
        address managerAddress_,
        address[] memory invitedAddresses_,
        address parentAddress_
    ) public returns (address) {
        Node node = new Node(managerAddress_, invitedAddresses_, parentAddress_);

        _setDeployerAsOwner(node, msg.sender);

        emit INodeFactory.NodeFactory_NodeCreated(address(node), invitedAddresses_, parentAddress_);

        return address(node);
    }

    /**
     * @notice set the deployer as the owner of the node
     * @param node_ the node to set the owner of
     * @param deployerAddress_ the address of the deployer
     */
    function _setDeployerAsOwner(Node node_, address deployerAddress_) private {
        node_.transferOwnership(deployerAddress_);
    }
}
