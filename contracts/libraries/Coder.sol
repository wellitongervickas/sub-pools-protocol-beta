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

function defaultCashbackBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }

    return abi.encode(0, 0);
}

function defaultMaxDeposit(Mode _mode) pure returns (bytes memory) {
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

function decodeSingleAssetIncrement(bytes memory _amount, bytes memory _increment) pure returns (uint256) {
    uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
    uint256 _decodedIncrementAmount = decodeSingleAssetAmount(_increment);

    return _decodedAmount + _decodedIncrementAmount;
}

function encodeSingleAssetIncrement(bytes memory _amount, bytes memory _increment) pure returns (bytes memory) {
    uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
    uint256 _decodedIncrementAmount = decodeSingleAssetAmount(_increment);

    return abi.encode(_decodedAmount + _decodedIncrementAmount);
}

function encodeSingleAssetDecrement(bytes memory _amount, bytes memory _decrement) pure returns (bytes memory) {
    uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
    uint256 _decodedDecrement = decodeSingleAssetAmount(_decrement);

    return abi.encode(_decodedAmount - _decodedDecrement);
}
