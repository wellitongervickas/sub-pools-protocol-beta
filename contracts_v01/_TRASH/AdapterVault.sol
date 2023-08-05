// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {ERC4626, IERC20, ERC20} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';

contract AdapterVault is ERC4626, Ownable {
    ///CONSTRUIR o proprio ERC4626 para o AdapterVault controlar o THIS
    constructor(IERC20 _asset) ERC4626(_asset) ERC20('AdapterVault', 'AV') {}

    /**
     * @dev only owner can deposit assets
     * @inheritdoc ERC4626
     */
    function deposit(uint256 assets, address receiver) public override onlyOwner returns (uint256) {
        return super.deposit(assets, receiver);
    }

    /**
     * @dev only owner can mint shares
     * @inheritdoc ERC4626
     */
    function mint(uint256 shares, address receiver) public override onlyOwner returns (uint256) {
        return super.mint(shares, receiver);
    }

    /**
     * @dev only owner can withdraw assets
     * @inheritdoc ERC4626
     */
    function withdraw(uint256 assets, address receiver, address owner) public override onlyOwner returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @dev only owner can redeem assets
     * @inheritdoc ERC4626
     */
    function redeem(uint256 shares, address receiver, address owner) public override onlyOwner returns (uint256) {
        return super.withdraw(shares, receiver, owner);
    }
}
