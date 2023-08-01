// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouter {
    event Router_NodeFactoryUpdated(address _nodeFactoryAddress);

    event Router_NodeCreated(address indexed _nodeAddress);

    event Router_NodeJoined(address indexed _parentAddress, address indexed _nodeAddress);

    function nodeFactory() external view returns (INodeFactory);

    function updateNodeFactory(address _nodeFactoryAddress) external;

    /**
     * @notice create a node
     * @param _invitedAddresses the addresses of the invited nodes
     * @return the address of the node
     * @dev emits a {Router_NodeCreated} event
     */
    function createNode(address[] memory _invitedAddresses) external returns (address);

    /**
     * @notice create a node
     * @param _parentNodeAddress the address of the parent node
     * @param _invitedAddresses the addresses of the invited nodes
     * @return the address of the node
     * @dev emits a {Router_NodeJoined} event
     */
    function joinNode(address _parentNodeAddress, address[] memory _invitedAddresses) external returns (address);
}
