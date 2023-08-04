// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouter {
    /// @dev Emitted when a node is created
    event Router_NodeCreated(address nodeAddress_);

    /// @dev Emitted when a node is joined
    event Router_NodeJoined(address parentAddress_, address nodeAddress_);

    /**
     * @notice create a node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @return the address of the node
     * @dev emits a {Router_NodeCreated} event
     */
    function createNode(address[] memory invitedAddresses_) external returns (address);

    /**
     * @notice create a node
     * @param _parentNodeAddress the address of the parent node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @return the address of the node
     * @dev emits a {Router_NodeJoined} event
     */
    function joinNode(address _parentNodeAddress, address[] memory invitedAddresses_) external returns (address);
}
