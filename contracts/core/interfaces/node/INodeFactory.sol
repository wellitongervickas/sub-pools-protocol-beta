// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeFactory {
    event NodeFactory_NodeCreated(address indexed _nodeAddress);

    function build(address _managerAddress, address[] memory _invitedAddresses) external returns (address);
}
