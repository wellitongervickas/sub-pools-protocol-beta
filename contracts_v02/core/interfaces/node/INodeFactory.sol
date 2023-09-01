// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INode} from '../node/INode.sol';

interface INodeFactory {
    event NodeFactory_NodeCreated(address nodeAddress_, address[] invitedAddresses_, address parentAddress_);

    function build(
        address managerAddress_,
        address[] memory invitedAddresses_,
        address parentAddress_
    ) external returns (INode);
}
