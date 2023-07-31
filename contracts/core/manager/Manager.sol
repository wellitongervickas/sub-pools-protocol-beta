// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import {IManager} from '../interfaces/manager/IManager.sol';

contract Manager is IManager, AccessControl {
    /// @dev role that has manager control rights
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    /// @inheritdoc IManager
    address public immutable managerAddress;

    /**
     * @notice construct the manager contract
     * @param _managerAddress the address of the manager
     */
    constructor(address _managerAddress) {
        managerAddress = _managerAddress;
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    /**
     * @notice modifier to check if the sender is a manager
     * @param _address the address to check
     */
    modifier onlyManager(address _address) {
        if (!IManager(_address).hasManagerRole(msg.sender)) revert IManager.Manager_Invalid();
        _;
    }

    /// @inheritdoc IManager
    function hasManagerRole(address _address) public view override returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }
}
