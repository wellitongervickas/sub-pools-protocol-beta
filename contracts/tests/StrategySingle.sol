// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {BytesLib, Mode} from '../libraries/Bytes.sol';

contract FakeStrategySingle is IStrategy {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    bytes public token;
    Mode public immutable mode = Mode.Single;

    constructor(bytes memory _token) {
        token = _token;
    }

    function deposit(address _depositor, bytes memory _amount) public {
        if (mode == Mode.Single) {
            IERC20(token.toSingleAddress()).safeTransferFrom(_depositor, address(this), _amount.toSingleAmount());
        } else {
            /// ToDo
        }
    }

    function withdraw(address _requisitor, bytes memory _amount) public {
        if (mode == Mode.Single) {
            IERC20(token.toSingleAddress()).transfer(_requisitor, _amount.toSingleAmount());
        } else {
            /// ToDo
        }
    }
}
