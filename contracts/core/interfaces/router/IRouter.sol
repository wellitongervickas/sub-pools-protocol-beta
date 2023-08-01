// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouter {
    event NodeFactory_Updated(address _nodeFactoryAddress);

    function nodeFactory() external view returns (INodeFactory);

    function updateNodeFactory(address _nodeFactoryAddress) external;
}
