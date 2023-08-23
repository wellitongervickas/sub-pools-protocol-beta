// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

abstract contract BaseAdapter {
    address public immutable target;

    function assetsIn() public virtual returns (IERC20[] memory) {}

    function deposit(bytes memory data) public virtual {}
}
