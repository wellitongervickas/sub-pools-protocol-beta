// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INodeControl {
    struct Setup {
        uint256 id;
        address managerAddress;
    }

    function nodes(address _nodeAddress) external view returns (INodeControl.Setup memory);
}
