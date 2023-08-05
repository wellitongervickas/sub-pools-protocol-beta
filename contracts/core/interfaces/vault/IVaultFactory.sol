// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;


interface IVaultFactory {
    event VaultFactory_VaultCreated(address vault_, address strategyAddress_);

    function build(address strategyAddress_) external returns (address);
}
