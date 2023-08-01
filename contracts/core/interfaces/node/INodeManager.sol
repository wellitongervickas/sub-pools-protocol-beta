// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeManager {
    /// @dev Emmits when a node is invited
    event NodeManager_Invited(address indexed _invitedAddress);

    /// @dev Emmits when change invited only mode
    event NodeManager_InvitedOnly(bool indexed _invitedOnly);

    /// @dev Emmits when a node role has updated
    event InvitedRoleUpdated(address indexed _address, bytes32 indexed _newRole);

    /// @dev throws if the invited address the menager
    error NodeManager_ManagerNotAllowed();

    /// @dev throws if the invited address is already invited
    error NodeManager_AlreadyInvited();

    error NodeManager_AlreadyNode();

    /**
     * @notice check if the contract is in invited only mode
     * @return true if the contract is in invited only mode
     */
    function invitedOnly() external view returns (bool);

    /**
     * @notice set the contract to invited only mode
     * @param _invitedOnly true if the contract is in invited only mode
     * @dev must only be called by the manager
     * @dev emits a {NodeManager_InvitedOnly} event
     */
    function setInvitedOnly(bool _invitedOnly) external;

    /**
     * @notice invite a node
     * @param _invitedAddress the address of the invited node
     * @dev must only be called by the manager
     * @dev must only invite address if not is invited yet
     * @dev must only invite address if not a node yet
     * @dev must only invite address if not is the manager itself
     * @dev emits a {NodeManager_Invited} event
     */
    function invite(address _invitedAddress) external;

    /**
     * @notice check if the address is invited
     * @param _address the address of the node
     * @return true if the address is invited
     */
    function hasInvitedRole(address _address) external view returns (bool);

    /**
     * @notice check if the address is a node
     * @param _address the address of the node
     * @return true if the address is a node
     */
    function hasNodeRole(address _address) external view returns (bool);
}
