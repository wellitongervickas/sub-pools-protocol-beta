// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {Vault} from './Vault.sol';

contract VaultFactory is IVaultFactory {
    function build(address strategyAddress_) public returns (address) {
        Vault vault = new Vault(strategyAddress_);

        _setDeployerAsOwner(vault, msg.sender);

        address vaultAddress = address(vault);

        emit IVaultFactory.VaultFactory_VaultCreated(vaultAddress, strategyAddress_);

        return vaultAddress;
    }

    function _setDeployerAsOwner(Vault vault_, address deployerAddress_) private {
        vault_.transferOwnership(deployerAddress_);
    }
}
