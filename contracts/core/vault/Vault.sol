// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract Vault is IVault, Ownable {
    IStrategy public immutable strategy;

    constructor(address strategy_) {
        strategy = IStrategy(strategy_);
    }
}
