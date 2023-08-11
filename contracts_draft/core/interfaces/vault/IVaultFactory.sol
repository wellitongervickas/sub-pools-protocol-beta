// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVault} from './IVault.sol';
import {IBaseAdapter} from '../adapters/IBaseAdapter.sol';

interface IVaultFactory {
    event VaultFactory_VaultCreated(address vaultAddress_, address adapterAddress_);

    function build(IBaseAdapter adapter_) external returns (IVault);
}
