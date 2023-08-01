// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouter {
    event Router_NodeFactoryUpdated(address _nodeFactoryAddress);

    event Router_NodeCreated(address _nodeAddress);

    function nodeFactory() external view returns (INodeFactory);

    function updateNodeFactory(address _nodeFactoryAddress) external;
}
