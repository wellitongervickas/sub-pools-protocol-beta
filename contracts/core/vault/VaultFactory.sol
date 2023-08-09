// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IBaseAdapter} from '../interfaces/adapters/IBaseAdapter.sol';
import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {Vault, IVault} from './Vault.sol';

contract VaultFactory is IVaultFactory {
    function build(IBaseAdapter adapter_) public returns (IVault) {
        Vault vault = new Vault(adapter_);

        _setDeployerAsOwner(vault, msg.sender);

        emit IVaultFactory.VaultFactory_VaultCreated(address(vault), address(adapter_));

        return vault;
    }

    function _setDeployerAsOwner(Vault vault_, address deployerAddress_) private {
        vault_.transferOwnership(deployerAddress_);
    }
}
