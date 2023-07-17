// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryControl} from './RegistryControl.sol';

contract Registry is IRegistry, RegistryControl, Ownable {
    IStrategy public strategy;

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier whenNotAccount(address _address) {
        if (accounts(_address).id != 0) revert AlreadyJoined();
        _;
    }

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);
        _join(msg.sender);
    }

    function _join(address _accountAddress) internal {
        _setupAccount(_accountAddress);
    }

    function joinAndDeposit(address _accountAddress) public onlyRouter whenNotAccount(_accountAddress) {
        _join(_accountAddress);
        emit Joined(_accountAddress);
    }
}
