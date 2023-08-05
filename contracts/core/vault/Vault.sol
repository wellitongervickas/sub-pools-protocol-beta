// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {VaultAccounts} from './VaultAccounts.sol';
import {VaultPositions} from './VaultPositions.sol';

contract Vault is IVault, VaultAccounts, VaultPositions, Ownable {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = IStrategy(strategy_);
    }
}
