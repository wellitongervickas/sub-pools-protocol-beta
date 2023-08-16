// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20, ERC20, ERC4626} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';

contract Vault is ERC4626, Ownable {
    constructor(IERC20 asset_, string memory name_, string memory symbol_) ERC4626(asset_) ERC20(name_, symbol_) {}

    function totalAssets() public view override returns (uint256) {
        return totalSupply();
    }

    function deposit(uint256 assets, address receiver) public override onlyOwner returns (uint256) {
        return _depositToReceiver(assets, receiver);
    }

    function _depositToReceiver(uint256 assets, address receiver) private returns (uint256) {
        require(assets <= maxDeposit(receiver), 'ERC4626: deposit more than max');

        uint256 shares = previewDeposit(assets);
        _deposit(receiver, receiver, assets, shares);

        return shares;
    }

    function mint(uint256 shares, address receiver) public override returns (uint256) {}

    function withdraw(uint256 assets, address receiver, address owner) public override onlyOwner returns (uint256) {
        return _withdrawToReceiver(assets, receiver, owner);
    }

    function _withdrawToReceiver(uint256 assets, address receiver, address owner) private returns (uint256) {
        require(assets <= maxWithdraw(owner), 'ERC4626: withdraw more than max');

        uint256 shares = previewWithdraw(assets);
        _withdraw(receiver, receiver, owner, assets, shares);

        return shares;
    }

    function redeem(uint256 shares, address receiver, address owner) public override returns (uint256) {}
}
