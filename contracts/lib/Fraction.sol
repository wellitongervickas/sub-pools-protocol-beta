// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

library FractionLib {
    struct Fraction {
        uint256 value; // numerator
        uint256 divider; // denominator
    }

    error DividerIsZero();
    error ValueIsZero();
}
