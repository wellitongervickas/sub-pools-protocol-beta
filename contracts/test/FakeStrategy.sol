// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../core/interfaces/strategy/IStrategy.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract FakeStrategy is IStrategy {
    using SafeERC20 for IERC20;

    bytes public assets;

    function deposit(address _depositor, bytes memory _amount) external returns (bytes memory) {
        return _amount;
    }

    function withdraw(address _requisitor, bytes memory _amount) external returns (bytes memory) {
        return _amount;
    }
}
