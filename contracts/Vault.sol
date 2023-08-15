// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {IERC20, ERC20, ERC4626} from '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';

contract Vault is ERC4626, AccessControl {
    bytes32 public constant REGISTRY_ROLE = keccak256('REGISTRY_ROLE');

    error Vault__InvalidRegistry(address sender_);

    constructor(ERC20 asset_, address registry_) ERC4626(asset_) ERC20(asset_.name(), asset_.symbol()) {
        _setRegistryRole(registry_);
    }

    modifier onlyRegistry() {
        if (!hasRegistryRole(msg.sender)) revert Vault__InvalidRegistry(msg.sender);
        _;
    }

    function _setRegistryRole(address address_) private {
        _grantRole(REGISTRY_ROLE, address_);
    }

    function hasRegistryRole(address address_) public view returns (bool) {
        return hasRole(REGISTRY_ROLE, address_);
    }

    function totalAssets() public view override returns (uint256) {
        return totalSupply();
    }

    function deposit(uint256 assets, address receiver) public override onlyRegistry returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) public override onlyRegistry returns (uint256) {
        return super.mint(shares, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner) public override onlyRegistry returns (uint256) {
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(uint256 shares, address receiver, address owner) public override onlyRegistry returns (uint256) {
        return super.redeem(shares, receiver, owner);
    }
}
