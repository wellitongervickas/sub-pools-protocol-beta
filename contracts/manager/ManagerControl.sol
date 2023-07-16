// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;
import {IManager} from '../interfaces/manager/IManager.sol';
import {IManagerControl} from '../interfaces/manager/IManagerControl.sol';

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';

contract ManagerControl is IManagerControl, AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    IManagerControl.Manager public manager;

    function _setupManager(address _managerAddress, address[] memory _invitedAddresses) internal {
        manager = IManagerControl.Manager({ownerAddress: _managerAddress});
        _setManagerRole(manager);
        _grantInvites(_invitedAddresses);
    }

    function _setManagerRole(IManagerControl.Manager storage _manager) private {
        _grantRole(MANAGER_ROLE, _manager.ownerAddress);
    }

    function _grantInvites(address[] memory _invitedAddresses) private {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
            emit IManagerControl.NodeManagerInvited(_invitedAddresses[i]);
        }
    }

    function _updateInvitedRole(address _address) internal {
        _revokeRole(INVITED_ROLE, _address);
        _grantRole(NODE_ROLE, _address);
    }

    function hasInvitedRole(address _address) public view returns (bool) {
        return hasRole(INVITED_ROLE, _address);
    }

    function hasRoleManager(address _address) internal view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function hasNodeRole(address _address) internal view returns (bool) {
        return hasRole(NODE_ROLE, _address);
    }
}
