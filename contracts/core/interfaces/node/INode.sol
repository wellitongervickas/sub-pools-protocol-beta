// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    /// @dev Emmits when a node is joined
    event Node_Joined(address nodeAddress_, address managerAddress_);

    /// @dev throws if the node is not invited
    error Node_NotInvited();

    /// @notice node parent address, zero if root
    function parent() external view returns (address);

    /**
     * @notice join as node
     * @param nodeAddress_ address of the invited node
     * @param managerAddress_ address of the manager to create an account
     * @dev must only be called by router
     * @dev must only join address if is invited
     * @dev must only join address if not a node yet
     * @dev emits a {Node_Joined} event
     */
    function join(address nodeAddress_, address managerAddress_) external;
}
