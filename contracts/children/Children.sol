// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ChildrenControl} from './ChildrenControl.sol';
import {ManagerControl} from '../manager/ManagerControl.sol';

contract Children is ChildrenControl, ManagerControl {
    Children public immutable parent;

    constructor(address _parentAddress, address _managerAddress) ManagerControl(_managerAddress) {
        parent = Children(_parentAddress);
    }
}
