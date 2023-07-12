// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {NodeControl} from './NodeControl.sol';
import {ManagerControl} from '../manager/ManagerControl.sol';

contract Node is NodeControl, ManagerControl {
    Node public immutable parent;

    constructor(address _parentAddress, address _managerAddress) ManagerControl(_managerAddress) {
        parent = Node(_parentAddress);
    }
}
