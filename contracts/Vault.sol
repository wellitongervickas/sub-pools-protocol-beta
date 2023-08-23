// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20, ERC20, ERC4626} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';

contract Vault is ERC4626 {
    constructor(IERC20 asset_, string memory name_, string memory symbol_) ERC4626(asset_) ERC20(name_, symbol_) {}

    function totalAssets() public view override returns (uint256) {
        return totalSupply();
    }
}
