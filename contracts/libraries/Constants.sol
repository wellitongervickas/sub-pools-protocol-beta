// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Mode} from './Bytes.sol';

function DEFAULT_INITIAL_BALANCE(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function DEFAULT_ADDITIONAL_BALANCE(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function DEFAULT_CASHBACK_BALANCE(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}
