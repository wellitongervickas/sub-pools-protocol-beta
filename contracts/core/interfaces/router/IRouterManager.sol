// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeFactory} from '../node/INodeFactory.sol';

interface IRouterManager {
    /// @dev Emitted when the node factory is updated
    event RouterManager_NodeFactoryUpdated(address nodeFactoryAddress_);

    /// @notice the node factory
    function nodeFactory() external view returns (INodeFactory);

    /**
     * @notice update the node factory
     * @param nodeFactoryAddress_ address of the node factory
     */
    function updateNodeFactory(address nodeFactoryAddress_) external;
}
