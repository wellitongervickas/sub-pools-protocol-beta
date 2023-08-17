// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Vault} from './Vault.sol';

contract VaultFactory {
    event VaultFactory_created(address vaultAddress_, address owner_);

    function createVault(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress_) {
        Vault vault = new Vault(asset_, name_, symbol_);

        vault.transferOwnership(msg.sender);

        vaultAddress_ = address(vault);

        emit VaultFactory_created(vaultAddress_, msg.sender);
    }
}
