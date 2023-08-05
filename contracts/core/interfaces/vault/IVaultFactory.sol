// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVault} from './IVault.sol';

interface IVaultFactory {
    event VaultFactory_VaultCreated(address vaultAddress_, address strategyAddress_);

    function build(address strategyAddress_) external returns (IVault);
}
