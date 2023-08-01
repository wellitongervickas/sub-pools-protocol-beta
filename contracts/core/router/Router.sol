// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {Manager} from '../manager/Manager.sol';

contract Router is IRouter, Manager {
    /// @inheritdoc IRouter
    INodeFactory public override nodeFactory;

    /**
     * @notice construct the router contract
     * @param _nodeFactoryAddress address of the node factory
     */
    constructor(address _nodeFactoryAddress) Manager(msg.sender) {
        _updateNodeFactory(_nodeFactoryAddress);
    }

    /// @inheritdoc IRouter
    function updateNodeFactory(address _nodeFactoryAddress) public override onlyManager(address(this)) {
        _updateNodeFactory(_nodeFactoryAddress);
        emit IRouter.Router_NodeFactoryUpdated(_nodeFactoryAddress);
    }

    /**
     * @notice update the node factory
     * @param _nodeFactoryAddress address of the node factory
     */
    function _updateNodeFactory(address _nodeFactoryAddress) private {
        nodeFactory = INodeFactory(_nodeFactoryAddress);
    }

    /// @inheritdoc IRouter
    function createNode(address[] memory _invitedAddresses) public override returns (address) {
        ///@dev zero address when root
        address _nodeAddress = _createNode(_invitedAddresses, address(0));

        emit IRouter.Router_NodeCreated(_nodeAddress);

        return _nodeAddress;
    }

    /**
     * @notice create a node
     * @param _invitedAddresses the addresses of the invited nodes
     * @param _parentAddress the address of the parent node
     * @return the address of the node
     */
    function _createNode(address[] memory _invitedAddresses, address _parentAddress) private returns (address) {
        address _nodeAddress = nodeFactory.build(msg.sender, _invitedAddresses, _parentAddress);
        return _nodeAddress;
    }

    /// @inheritdoc IRouter
    function joinNode(
        address _parentNodeAddress,
        address[] memory _invitedAddresses
    ) external override returns (address) {
        INode _parent = INode(_parentNodeAddress);

        address _nodeAddress = _createNode(_invitedAddresses, _parentNodeAddress);
        _parent.join(_nodeAddress, msg.sender);

        emit IRouter.Router_NodeJoined(_parentNodeAddress, _nodeAddress);

        return _nodeAddress;
    }
}
