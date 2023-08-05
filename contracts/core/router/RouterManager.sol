// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterManager} from '../interfaces/router/IRouterManager.sol';
import {Manager} from '../manager/Manager.sol';
import {INode} from '../interfaces/node/INode.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';

contract RouterManager is IRouterManager, Manager {
    INodeFactory public override nodeFactory;

    mapping(INode => bool) private _nodes;

    constructor(INodeFactory nodeFactory_) Manager(msg.sender) {
        _updateNodeFactory(nodeFactory_);
    }

    function _updateNodeFactory(INodeFactory nodeFactory_) private {
        nodeFactory = nodeFactory_;
    }

    function updateNodeFactory(INodeFactory nodeFactory_) external override onlyManager(address(this)) {
        _updateNodeFactory(nodeFactory_);
        emit IRouterManager.RouterManager_NodeFactoryUpdated(address(nodeFactory_));
    }

    function _buildNode(address[] memory invitedAddresses_, address parentAddress_) internal returns (address) {
        address nodeAddress = nodeFactory.build(msg.sender, invitedAddresses_, parentAddress_);

        _registryNode(INode(nodeAddress));

        return nodeAddress;
    }

    function _registryNode(INode node_) private {
        /// @dev do not required a manual trust since the node factory is trusted
        _setNodeTrust(node_, true);
    }

    function _setNodeTrust(INode node_, bool isTrusted_) private {
        _nodes[node_] = isTrusted_;
    }

    function trustNode(INode node_, bool isTrusted_) external override onlyManager(address(this)) {
        _setNodeTrust(node_, isTrusted_);

        emit IRouterManager.RouterManager_NodeTrust(node_, isTrusted_);
    }

    function nodes(INode node_) public view override returns (bool) {
        return _nodes[INode(node_)];
    }
}
