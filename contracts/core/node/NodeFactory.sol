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

        /// @dev set router as owner
        node.transferOwnership(msg.sender);

        emit INodeFactory.NodeFactory_NodeCreated(address(node), invitedAddresses_, parentAddress_);

        return address(node);
    }
}
