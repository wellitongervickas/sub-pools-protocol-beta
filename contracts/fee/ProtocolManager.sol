// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Manager, IManager} from '../manager/Manager.sol';

contract ProtocolManager is Manager {
    constructor() {
        _setManagerRole(msg.sender);
    }
}
