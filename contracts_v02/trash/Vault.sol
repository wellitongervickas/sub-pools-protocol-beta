// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

// import {ERC20, IERC20, IERC20Metadata} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
// import {IERC4626} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';
import {BaseAdapter} from './BaseAdapter.sol';

contract Vault is BaseAdapter {
    constructor(bytes memory assetsIn_, bytes memory assetsOut_) BaseAdapter(assetsIn_, assetsOut_) {}
}
