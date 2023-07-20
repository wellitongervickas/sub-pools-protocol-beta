// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {Mode} from '../libraries/Coder.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../libraries/Coder.sol' as Coder;

contract FakeStrategySingle is IStrategy {
    using SafeERC20 for IERC20;

    bytes public token;
    Mode public immutable mode = Mode.Single;

    constructor(bytes memory _token) {
        token = _token;
    }

    function deposit(address _depositor, bytes memory _amount) public {
        if (mode == Mode.Single) {
            IERC20(Coder.decodeSingleAddress(token)).safeTransferFrom(
                _depositor,
                address(this),
                Coder.decodeSingleAssetAmount(_amount)
            );
        }
    }

    function withdraw(address _requisitor, bytes memory _amount) public {
        if (mode == Mode.Single) {
            IERC20(Coder.decodeSingleAddress(token)).transfer(_requisitor, Coder.decodeSingleAssetAmount(_amount));
        }
    }
}
