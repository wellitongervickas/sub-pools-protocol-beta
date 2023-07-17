// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

contract FakeStrategy is IStrategy {
    using SafeERC20 for IERC20;
    bytes public token;

    constructor(bytes memory _token) {
        token = _token;
    }

    function deposit(bytes memory _amount) public {}
}
