// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ManagerLib} from '../lib/Manager.sol';

interface IManager {
    event NodeManagerInvited(address indexed _invitedAddress);

    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();

    function invite(address _invitedAddress) external;
}
