// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeControl {
    struct Setup {
        uint256 id;
        address managerAddress;
    }

    function node(address _nodeAddress) external view returns (INodeControl.Setup memory);
}
