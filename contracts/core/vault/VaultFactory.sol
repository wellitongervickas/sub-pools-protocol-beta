// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IVaultFactory} from '../interfaces/vault/IVaultFactory.sol';
import {Vault, IVault} from './Vault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract VaultFactory is IVaultFactory {
    function build(IStrategy strategy_) public returns (address) {
        Vault vault = new Vault(strategy_);

        _setDeployerAsOwner(vault, msg.sender);

        emit IVaultFactory.VaultFactory_VaultCreated(address(vault), address(strategy_));

        return address(vault);
    }

    function _setDeployerAsOwner(Vault vault_, address deployerAddress_) private {
        vault_.transferOwnership(deployerAddress_);
    }
}
