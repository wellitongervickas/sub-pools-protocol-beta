// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Vault} from './Vault.sol';

contract VaultFactory {
    event VaultFactory_created(address vaultAddress_);

    function createVault(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress) {
        Vault vault = new Vault(asset_, name_, symbol_);

        vaultAddress = address(vault);
        emit VaultFactory_created(vaultAddress);
    }
}
