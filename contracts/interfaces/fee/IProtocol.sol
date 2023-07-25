// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from '../../libraries/Fraction.sol';

interface IProtocol {
    function treasuryAddress() external view returns (address);

    function setTreasuryAddress(address _treasuryAddress) external;

    function protocolFees() external view returns (FractionLib.Fraction memory);

    function setProtocolFees(FractionLib.Fraction memory _fees) external;
}
