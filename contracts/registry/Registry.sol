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
        _join(_msgSender(), abi.encode(0));
    }

    function _join(address _accountAddress, bytes memory _amount) private {
        _setupAccount(_accountAddress, _amount);
    }

    function joinAndDeposit(
        address _accountAddress,
        bytes memory _amount
    ) public onlyRouter whenNotAccount(_accountAddress) {
        _join(_accountAddress, _amount);
        strategy.deposit(_amount);
        emit Joined(_accountAddress, _amount);
    }

    function _depositToStrategy(bytes memory _amount) private {
        strategy.deposit(_amount);
    }
}
