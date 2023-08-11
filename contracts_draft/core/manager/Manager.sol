// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import {IManager} from '../interfaces/manager/IManager.sol';

contract Manager is IManager, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    address public immutable managerAddress;

    constructor(address _managerAddress) {
        managerAddress = _managerAddress;
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    modifier onlyManager(address _address) {
        if (!IManager(_address).hasManagerRole(msg.sender)) revert IManager.Manager_Invalid();
        _;
    }

    function hasManagerRole(address _address) public view override returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }
}
