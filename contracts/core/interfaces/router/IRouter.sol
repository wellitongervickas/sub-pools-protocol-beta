// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouter {
    /// @dev Emitted when a node is created
    event Router_NodeCreated(address nodeAddress_);

    /// @dev Emitted when a node is joined
    event Router_NodeJoined(address parentAddress_, address nodeAddress_);

    /// @dev throws if the node is not registered
    error Router_OnlyRegisteredNode();

    /**
     * @notice create a node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @return the address of the node
     * @dev emits a {Router_NodeCreated} event
     */
    function createNode(address[] memory invitedAddresses_) external returns (address);

    /**
     * @notice create a node
     * @param parentNodeAddress_ the address of the parent node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @return the address of the node
     * @dev only registered parent node can be joined
     * @dev emits a {Router_NodeJoined} event
     */
    function joinNode(address parentNodeAddress_, address[] memory invitedAddresses_) external returns (address);
}
