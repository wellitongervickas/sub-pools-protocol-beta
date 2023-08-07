// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVault} from './IVault.sol';
import {IStrategy} from '../strategy/IStrategy.sol';

interface IVaultFactory {
    event VaultFactory_VaultCreated(address vaultAddress_, address strategyAddress_);

    function build(IStrategy strategy_) external returns (IVault);
}
