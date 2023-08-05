// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterManager} from './RouterManager.sol';
import {INodeFactory} from '../interfaces/node/INodeFactory.sol';
import {INode} from '../interfaces/node/INode.sol';
import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';

contract Router is IRouter, RouterManager {
    constructor(INodeFactory nodeFactory_, IVaultFactory vaultFactory) RouterManager(nodeFactory_, vaultFactory) {}

    modifier onlyTrustedNode(address nodeAddress_) {
        if (!nodes(INode(nodeAddress_))) revert IRouter.Router_OnlyTrustedNode();
        _;
    }

    function createNode(address[] memory invitedAddresses_) public override returns (address) {
        address nodeAddress = _buildNode(invitedAddresses_, address(0));

        emit IRouter.Router_NodeCreated(nodeAddress);
        return nodeAddress;
    }

    function joinNode(
        address parentNodeAddress_,
        address[] memory invitedAddresses_
    ) external override onlyTrustedNode(parentNodeAddress_) returns (address) {
        INode parent = INode(parentNodeAddress_);

        address nodeAddress = _buildNode(invitedAddresses_, parentNodeAddress_);
        parent.join(nodeAddress, msg.sender);

        emit IRouter.Router_NodeJoined(parentNodeAddress_, nodeAddress);
        return nodeAddress;
    }
}
