// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract VaultAdapter {
    IStrategy public immutable strategy;

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    function _deposit(bytes memory amount_) internal pure returns (bytes memory) {
        // uint256 positionId = strategy.addPosition(amount_);
        // uint256[] memory amounts = abi.decode(amount_, (uint256[]));
        // console.log('a', amounts.length, amounts[0]);

        /// ToDO = deposit to registry
        return amount_;
    }
}
