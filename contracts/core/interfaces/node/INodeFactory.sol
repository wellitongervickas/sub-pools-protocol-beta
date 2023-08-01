// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeFactory {
    event NodeFactory_NodeCreated(address indexed _nodeAddress);

    /**
     * @notice build a new node contract
     * @param _managerAddress address of the manager
     * @param _invitedAddresses addresses of the invited nodes
     * @return address of the new node contract
     */
    function build(address _managerAddress, address[] memory _invitedAddresses) external returns (address);
}
