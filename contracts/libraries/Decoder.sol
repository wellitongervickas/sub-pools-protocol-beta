// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

enum Mode {
    Single
}

function defaultRequiredInitialDeposit(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }

    return abi.encode(0, 0);
}

function defaultInitialBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }

    return abi.encode(0, 0);
}

function defaultAdditionalBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }

    return abi.encode(0, 0);
}
