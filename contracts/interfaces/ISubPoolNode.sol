// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface ISubPoolNode {
    /// @notice Throws when try to call only manager function
    error ExceedMaxAdditionalDeposit();

    /// @notice set the parent node address. Only router can set once.
    /// @param _parent the address of the parent node
    function setParent(address _parent) external;

    /// @notice join as children node
    /// @param _nodeAddress the address of the node
    /// @param _amount the amount of the node as initial deposit
    /// @return the id of the new node
    function join(address _nodeAddress, address _managerAddress, uint256 _amount) external returns (uint256);

    /// @notice additional deposit in current and parent  context balance
    /// @param _amount the amount to deposit
    function additionalDeposit(uint256 _amount) external;

    /// @notice decrease balance in current and parent context balance
    /// @param _amount the amount to withdraw
    function withdrawBalance(uint256 _amount) external;

    /// @notice ecrease initial balance in current context and balance in parent context
    /// @param _amount the amount to cashback from initial balance
    function withdrawInitialBalance(uint256 _amount) external;
}
