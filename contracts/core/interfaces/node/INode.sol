// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    /// @dev Emmits when a node is joined
    event Node_Joined(address indexed _nodeAddress, address indexed _managerAddress);

    /// @dev throws if the node is not invited
    error Node_NotInvited();

    /// @notice registry address
    function registry() external view returns (address);

    /// @notice node parent address, zero if root
    function parent() external view returns (address);

    /**
     * @notice join as node
     * @param _nodeAddress address of the node to create an account
     * @param _managerAddress address of the manager to create an account
     */
    function join(address _nodeAddress, address _managerAddress) external;
}
