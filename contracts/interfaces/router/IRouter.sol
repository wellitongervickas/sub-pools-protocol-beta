// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IRouter {
    event NodeCreated(address indexed _nodeAddress);

    function create(address[] memory _invitedAddresses) external returns (address);

    function join(address _parentAddress, address[] memory _invitedAddresses) external returns (address);
}
