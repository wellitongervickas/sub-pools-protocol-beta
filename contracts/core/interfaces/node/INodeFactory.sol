// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeFactory {
    event NodeFactory_NodeCreated(
        address nodeAddress_,
        address[] invitedAddresses_,
        address parentAddress_,
        address registryAddress_
    );

    /**
     * @notice build a new node contract
     * @param managerAddress_ address of the manager
     * @param invitedAddresses_ addresses of the invited nodes
     * @param parentAddress_ address of the parent node, zero when root
     * @return address of the new node contract
     */
    function build(
        address managerAddress_,
        address[] memory invitedAddresses_,
        address parentAddress_,
        address registryAddress_
    ) external returns (address);
}
