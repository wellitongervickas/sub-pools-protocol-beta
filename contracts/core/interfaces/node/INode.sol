// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    /// @dev Emmits when a node is joined
    event Node_Joined(address indexed _nodeAddress, address indexed _managerAddress);

    /// @dev throws if the node is not invited
    error Node_NotInvited();

    /// @dev throws if the invited address is already a node
    error Node_AlreadyJoined();

    /// @notice registry address
    function registry() external view returns (address);

    /// @notice node parent address, zero if root
    function parent() external view returns (address);

    /**
     * @notice join as node
     * @param _nodeAddress address of the invited node
     * @param _managerAddress address of the manager to create an account
     * @dev must only be called by router
     * @dev must only join address if is invited
     * @dev must only join address if not a node yet
     * @dev emits a {Node_Joined} event
     */
    function join(address _nodeAddress, address _managerAddress) external;
}
