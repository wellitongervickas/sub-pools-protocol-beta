// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {Vault, IVault} from './Vault.sol';

contract VaultFactory is IVaultFactory {
    function build(address strategyAddress_) public returns (IVault) {
        Vault vault = new Vault(strategyAddress_);

        _setDeployerAsOwner(vault, msg.sender);

        emit IVaultFactory.VaultFactory_VaultCreated(address(vault), strategyAddress_);

        return vault;
    }

    function _setDeployerAsOwner(Vault vault_, address deployerAddress_) private {
        vault_.transferOwnership(deployerAddress_);
    }
}
