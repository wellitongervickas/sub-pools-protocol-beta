// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeFactory {
    event NodeFactory_NodeCreated(address indexed _nodeAddress, address[] _invitedAddresses, address _parentAddress);

    /**
     * @notice build a new node contract
     * @param _managerAddress address of the manager
     * @param _invitedAddresses addresses of the invited nodes
     * @param _parentAddress address of the parent node, zero when root
     * @return address of the new node contract
     */
    function build(
        address _managerAddress,
        address[] memory _invitedAddresses,
        address _parentAddress
    ) external returns (address);
}
