// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IStrategy, StrategyType} from '../interfaces/strategy/IStrategy.sol';
import {IRegistry} from '../interfaces/registry/IRegistry.sol';

import {RegistryLib} from '../libraries/Registry.sol';
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
        _join(_msgSender());
    }

    function _join(address _accountAddress) private {
        _setupAccount(_accountAddress);
    }

    function join(address _accountAddress) public onlyRouter whenNotAccount(_accountAddress) {
        _join(_accountAddress);
        emit Joined(_accountAddress);
    }

    function deposit(address _accountAddress, bytes memory _amount) external onlyRouter {}
}
