// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeControl {
    struct Setup {
        address ownerAddress;
    }

    function node(address _nodeAddress) external view returns (INodeControl.Setup memory);
}
