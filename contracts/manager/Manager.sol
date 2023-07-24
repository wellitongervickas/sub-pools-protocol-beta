// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import {IManager} from '../interfaces/manager/IManager.sol';

contract Manager is IManager, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    function _setManagerRole(address _address) internal {
        _grantRole(MANAGER_ROLE, _address);
    }

    function hasRoleManager(address _address) public view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }
}
