// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library BytesLib {
    function toAddresses(bytes memory assets) internal pure returns (address[] memory) {
        return abi.decode(assets, (address[]));
    }

    function toAmounts(bytes memory amounts) internal pure returns (uint256[] memory) {
        return abi.decode(amounts, (uint256[]));
    }

    function fromAddresses(address[] memory addresses_) internal pure returns (bytes memory) {
        return abi.encode(addresses_);
    }
}
