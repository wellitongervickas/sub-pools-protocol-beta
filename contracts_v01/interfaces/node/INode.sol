// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    function registry() external view returns (address);

    function parent() external view returns (address);

    function join(address _nodeAddress, address _nodeOwnerAddress) external;
}
