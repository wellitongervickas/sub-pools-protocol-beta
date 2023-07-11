// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

import {ManagerLib} from '../libraries/Manager.sol';

contract ManagerControl {
    ManagerLib.Manager public manager;

    constructor(address _managerAddress) {
        manager = ManagerLib.Manager({managerAddress: _managerAddress});
    }
}
