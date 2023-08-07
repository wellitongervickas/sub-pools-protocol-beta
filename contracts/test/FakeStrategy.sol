// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {EncodedERC20Transfer} from '../core/library/EncodedERC20Transfer.sol';

contract FakeStrategy is IStrategy, EncodedERC20Transfer {
    constructor(address[] memory assets_) EncodedERC20Transfer(assets_) {}

    function deposit(address depositor_, bytes memory amount_) external returns (bytes memory) {
        return _receiveAssets(depositor_, amount_);
    }

    function withdraw(address requisitor_, bytes memory amount_) external returns (bytes memory) {
        return _sendAssets(requisitor_, amount_);
    }
}
