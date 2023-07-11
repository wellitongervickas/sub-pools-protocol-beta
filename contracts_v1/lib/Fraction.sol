// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

library FractionLib {
    /// @notice a fraction
    /// @param value the numerator
    /// @param divider the denominator
    struct Fraction {
        uint256 value;
        uint256 divider;
    }
}
