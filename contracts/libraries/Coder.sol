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

function decodeSingleAddress(bytes memory _data) pure returns (address) {
    return abi.decode(_data, (address));
}

function decodeMultiAddress(bytes memory _data) pure returns (address, address) {
    return abi.decode(_data, (address, address));
}

function decodeSingleAssetAmount(bytes memory _data) pure returns (uint256) {
    return abi.decode(_data, (uint256));
}

function decodeMultiAssetAmount(bytes memory _data) pure returns (uint256, uint256) {
    return abi.decode(_data, (uint256, uint256));
}

function encodeSingleAssetAmount(uint256 _amount) pure returns (bytes memory) {
    return abi.encode(_amount);
}

function encodeMultiAssetAmount(uint256 _amount1, uint256 _amount2) pure returns (bytes memory) {
    return abi.encode(_amount1, _amount2);
}
