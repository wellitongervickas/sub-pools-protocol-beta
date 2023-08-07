// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library BytesLib {
    function toAddresses(bytes memory assets) internal pure returns (address[] memory) {
        return abi.decode(assets, (address[]));
    }
    // function toSingleAmount(bytes memory _self) internal pure returns (uint256) {
    //     return abi.decode(_self, (uint256));
    // }

    // function toSingleAddress(bytes memory _data) internal pure returns (address) {
    //     return abi.decode(_data, (address));
    // }

    // function fraction(
    //     bytes memory _self,
    //     Mode _mode,
    //     uint256 _value,
    //     uint256 _divider
    // ) internal pure returns (bytes memory) {
    //     if (_mode == Mode.Single) {
    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         uint256 _fractionAmount = (_decodedAmount * _value) / _divider;

    //         return abi.encode(_fractionAmount);
    //     } else {
    //         /// todo
    //         return abi.encode(0, 0);
    //     }
    // }

    // function increment(bytes memory _self, Mode _mode, bytes memory _otherAmount) internal pure returns (bytes memory) {
    //     if (_mode == Mode.Single) {
    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         uint256 _decodedIncrementAmount = toSingleAmount(_otherAmount);

    //         return abi.encode(_decodedAmount + _decodedIncrementAmount);
    //     } else {
    //         /// todo
    //         return abi.encode(0, 0);
    //     }
    // }

    // function decrement(bytes memory _self, Mode _mode, bytes memory _otherAmount) internal pure returns (bytes memory) {
    //     if (_mode == Mode.Single) {
    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         uint256 _decodedOtherAmount = toSingleAmount(_otherAmount);

    //         return abi.encode(_decodedAmount - _decodedOtherAmount);
    //     } else {
    //         /// todo
    //         return abi.encode(0, 0);
    //     }
    // }

    // function ifNotZeroIsEqual(bytes memory _self, Mode _mode, bytes memory _otherAmount) internal pure returns (bool) {
    //     if (_mode == Mode.Single) {
    //         uint256 _otherDecodedAmount = toSingleAmount(_otherAmount);
    //         if (_otherDecodedAmount == 0) return true;

    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         return _decodedAmount == _otherDecodedAmount;
    //     } else {
    //         /// todo
    //         return true;
    //     }
    // }

    // function ifNotZeroExceeds(bytes memory _self, Mode _mode, bytes memory _otherAmount) internal pure returns (bool) {
    //     if (_mode == Mode.Single) {
    //         uint256 _otherDecodedAmount = toSingleAmount(_otherAmount);
    //         if (_otherDecodedAmount == 0) return false;

    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         return _decodedAmount > _otherDecodedAmount;
    //     } else {
    //         /// todo
    //         return false;
    //     }
    // }

    // function greaterThan(bytes memory _self, Mode _mode, bytes memory _otherAmount) internal pure returns (bool) {
    //     if (_mode == Mode.Single) {
    //         uint256 _decodedAmount = toSingleAmount(_self);
    //         uint256 _decodedOtherAmount = toSingleAmount(_otherAmount);

    //         return _decodedAmount > _decodedOtherAmount;
    //     } else {
    //         /// todo
    //         return false;
    //     }
    // }
}
