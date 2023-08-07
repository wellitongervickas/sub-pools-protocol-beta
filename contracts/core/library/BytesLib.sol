// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library BytesLib {
    function _toAddresses(bytes memory assets) internal pure returns (address[] memory) {
        return abi.decode(assets, (address[]));
    }

    function _toAmounts(bytes memory amounts) internal pure returns (uint256[] memory) {
        return abi.decode(amounts, (uint256[]));
    }
}
