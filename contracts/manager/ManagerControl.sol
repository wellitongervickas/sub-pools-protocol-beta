// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

import {ManagerLib} from '../libraries/Manager.sol';

contract ManagerControl is AccessControl {
    bytes32 private constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 private constant INVITED_ROLE = keccak256('INVITED_ROLE');

    ManagerLib.Manager public manager;

    constructor(address _managerAddress) {
        manager = ManagerLib.Manager({managerAddress: _managerAddress});
        _setManagerRole(manager);
    }

    function _setManagerRole(ManagerLib.Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.managerAddress);
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        _grantRole(INVITED_ROLE, _invitedAddress);
    }

    function hasInvitedRole(address _invitedAddress) public view returns (bool) {
        return hasRole(INVITED_ROLE, _invitedAddress);
    }
}
