// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {NodeLib} from '../lib/Node.sol';

interface INode {
    error NotAllowed();
    error LockPeriod();
    error ParentNotFound();
    error ParentAlreadySet();
    error InvalidInitialAmount();
    error InvalidAdditionalAmount();

    function children(address _address) external view returns (NodeLib.Node memory);

    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function cashback(uint256 _amount) external;
}
