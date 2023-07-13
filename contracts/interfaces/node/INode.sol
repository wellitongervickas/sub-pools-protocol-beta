// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    function join(address _nodeAddress, address _managerAddress) external;
}
