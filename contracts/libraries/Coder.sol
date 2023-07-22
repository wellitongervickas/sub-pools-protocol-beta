// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

enum Mode {
    Single
}

function defaultRequiredInitialDeposit(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function defaultInitialBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function defaultAdditionalBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function defaultCashbackBalance(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function defaultMaxDeposit(Mode _mode) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        return abi.encode(0);
    }
    /// todo
    return abi.encode(0, 0);
}

function decodeSingleAddress(bytes memory _data) pure returns (address) {
    return abi.decode(_data, (address));
}

function decodeSingleAssetAmount(bytes memory _data) pure returns (uint256) {
    return abi.decode(_data, (uint256));
}

function encodeSingleAssetAmount(uint256 _amount) pure returns (bytes memory) {
    return abi.encode(_amount);
}

function encodeAssetIncrement(Mode _mode, bytes memory _amount, bytes memory _increment) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        uint256 _decodedIncrementAmount = decodeSingleAssetAmount(_increment);

        return abi.encode(_decodedAmount + _decodedIncrementAmount);
    } else {
        /// todo
        return abi.encode(0, 0);
    }
}

function encodeAssetDecrement(Mode _mode, bytes memory _amount, bytes memory _decrement) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        uint256 _decodedDecrement = decodeSingleAssetAmount(_decrement);

        return abi.encode(_decodedAmount - _decodedDecrement);
    } else {
        /// todo
        return abi.encode(0, 0);
    }
}

function encodeAssetDecrementFraction(
    Mode _mode,
    uint256 _value,
    uint256 _divider,
    bytes memory _amount
) pure returns (bytes memory) {
    if (_mode == Mode.Single) {
        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        uint256 _feesAmount = (_decodedAmount * _value) / _divider;
        return abi.encode(_feesAmount);
    } else {
        /// todo
        return abi.encode(0, 0);
    }
}

function checkAssetsGreaterThanAmount(Mode _mode, bytes memory _amount, bytes memory _otherAmount) pure returns (bool) {
    if (_mode == Mode.Single) {
        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        uint256 _decodedOtherAmount = decodeSingleAssetAmount(_otherAmount);

        return _decodedAmount > _decodedOtherAmount;
    } else {
        /// todo
        return false;
    }
}

function checkAssetsExceedsAmount(Mode _mode, bytes memory _amount, bytes memory _otherAmount) pure returns (bool) {
    if (_mode == Mode.Single) {
        uint256 _otherDecodedAmount = decodeSingleAssetAmount(_otherAmount);
        if (_otherDecodedAmount == 0) return false;

        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        return _otherDecodedAmount > 0 && _decodedAmount > _otherDecodedAmount;
    } else {
        /// todo
        return false;
    }
}

function checkAssetsEqualAmount(Mode _mode, bytes memory _amount, bytes memory _otherAmount) pure returns (bool) {
    if (_mode == Mode.Single) {
        uint256 _otherDecodedAmount = decodeSingleAssetAmount(_otherAmount);
        if (_otherDecodedAmount == 0) return true;

        uint256 _decodedAmount = decodeSingleAssetAmount(_amount);
        return _decodedAmount == _otherDecodedAmount;
    } else {
        /// todo
        return true;
    }
}
