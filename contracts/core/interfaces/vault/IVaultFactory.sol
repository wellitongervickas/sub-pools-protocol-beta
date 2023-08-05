// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../strategy/IStrategy.sol';

interface IVaultFactory {
    event VaultFactory_VaultCreated(address vault_, address strategy_);

    function build(IStrategy strategy_) external returns (address);
}
