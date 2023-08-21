// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Vault} from './Vault.sol';

contract VaultFactory {
    event VaultFactory_Created(address vaultAddress_);

    function createVault(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress) {
        vaultAddress = address(new Vault(asset_, name_, symbol_));
        emit VaultFactory_Created(vaultAddress);
    }
}
