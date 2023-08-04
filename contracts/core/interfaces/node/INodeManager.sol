// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeManager {
    /// @dev Emmits when a node is invited
    event NodeManager_Invited(address invitedAddress_);

    /// @dev Emmits when change invited only mode
    event NodeManager_InvitedOnly(bool invitedOnly_);

    /// @dev throws if the invited address the menager
    error NodeManager_ManagerNotAllowed();

    /// @dev throws if the invited address is already invited
    error NodeManager_AlreadyInvited();

    /// @dev throws if the invited address is already a node
    error NodeManager_AlreadyNode();

    /**
     * @notice check if the contract is in invited only mode
     * @return true if the contract is in invited only mode
     */
    function invitedOnly() external view returns (bool);

    /**
     * @notice set the contract to invited only mode
     * @param invitedOnly_ true if the contract is in invited only mode
     * @dev must only be called by the manager
     * @dev emits a {NodeManagerInvitedOnly_} event
     */
    function setInvitedOnly(bool invitedOnly_) external;

    /**
     * @notice invite a node
     * @param invitedAddress_ the address of the invited node
     * @dev must only be called by the manager
     * @dev must only invite address if not is invited yet
     * @dev must only invite address if not a node yet
     * @dev must only invite address if not is the manager itself
     * @dev emits a {NodeManager_Invited} event
     */
    function invite(address invitedAddress_) external;

    /**
     * @notice check if the address is invited
     * @param address_ the address of the node
     * @return true if the address is invited
     */
    function hasInvitedRole(address address_) external view returns (bool);

    /**
     * @notice check if the address is a node
     * @param address_ the address of the node
     * @return true if the address is a node
     */
    function hasNodeRole(address address_) external view returns (bool);
}
