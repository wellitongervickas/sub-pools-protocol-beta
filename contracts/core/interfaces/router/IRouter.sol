// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../strategy/IStrategy.sol';

interface IRouter {
    event Router_NodeCreated(address nodeAddress_);
    event Router_NodeJoined(address parentAddress_, address nodeAddress_);
    event Router_StrategyVaultRequest(address strategyAddress_, address vaultAddress_);

    error Router_OnlyTrustedNode();

    function createNode(address[] memory invitedAddresses_) external returns (address);

    function joinNode(address parentNodeAddress_, address[] memory invitedAddresses_) external returns (address);

    function requestStrategyVault(address strategyAddress_) external returns (address);
}
