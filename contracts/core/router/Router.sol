// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterManager} from './RouterManager.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {Manager} from '../manager/Manager.sol';

contract Router is IRouter, RouterManager {
    /// @dev see IRouterManager
    constructor(address _nodeFactoryAddress) RouterManager(_nodeFactoryAddress) {}

    /// @inheritdoc IRouter
    function createNode(
        address[] memory invitedAddresses_,
        address registryAddress_
    ) public override returns (address) {
        ///@dev zero address when root
        address nodeAddress = _createNode(invitedAddresses_, address(0), registryAddress_);

        emit IRouter.Router_NodeCreated(nodeAddress);

        return nodeAddress;
    }

    /**
     * @notice create a node
     * @param invitedAddresses_ the addresses of the invited nodes
     * @param parentAddress_ the address of the parent node
     * @return the address of the node
     */
    function _createNode(
        address[] memory invitedAddresses_,
        address parentAddress_,
        address registryAddress_
    ) private returns (address) {
        address _nodeAddress = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_, registryAddress_);
        return _nodeAddress;
    }

    /// @inheritdoc IRouter
    function joinNode(
        address parentNodeAddress_,
        address[] memory invitedAddresses_
    ) external override returns (address) {
        INode parent = INode(parentNodeAddress_);

        address _nodeAddress = _createNode(invitedAddresses_, parentNodeAddress_, parent.registry());
        parent.join(_nodeAddress, msg.sender);

        emit IRouter.Router_NodeJoined(parentNodeAddress_, _nodeAddress);

        return _nodeAddress;
    }
}
