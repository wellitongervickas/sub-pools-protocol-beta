// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20, ERC20, ERC4626} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';

contract Vault is ERC4626, Ownable {
    constructor(ERC20 asset_) ERC4626(asset_) ERC20(asset_.name(), asset_.symbol()) {}

    function totalAssets() public view override returns (uint256) {
        return totalSupply();
    }

    function deposit(uint256 assets, address receiver) public override onlyOwner returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) public override onlyOwner returns (uint256) {
        return super.mint(shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner) public override onlyOwner returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(uint256 shares, address receiver, address owner) public override onlyOwner returns (uint256) {
        return super.redeem(shares, receiver, owner);
    }

    /// todo: transfer (onylOwner)
}
