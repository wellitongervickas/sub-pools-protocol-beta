// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface INode {
    event Node_Joined(address nodeAddress_, address managerAddress_);

    error Node_NotInvited();

    function parent() external view returns (address);

    function join(address nodeAddress_, address managerAddress_) external;
}
