// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {StrategyLib} from '../../libraries/Strategy.sol';

// import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

// struct Tokens {
//     IERC20 token1;
// }

interface IStrategy {
    function strategyType() external view returns (StrategyLib.StrategyType);

    function tokenData() external view returns (bytes memory);
}
