// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {VaultFactory} from './VaultFactory.sol';

contract Registry is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

    VaultFactory public vaultFactory;

    struct Vault {
        address vaultAddress;
        bool isTrusted;
    }

    mapping(IERC20 => Vault) public vault;

    event Registry_VaultCreated(address vaultAddress_, address deployer_);
    event Registry_VaultTrusted(IERC20 asset_);

    error Registry_OnlyManager();
    error Registry_VaultAlreadyTrusted(address vaultAddress_);
    error Registry_VaultAlreadyExists(address vaultAddress_);

    constructor(VaultFactory vaultFactory_, address manager_) {
        vaultFactory = vaultFactory_;
        _setManagerRole(manager_);
    }

    modifier onlyManager() {
        if (!hasRoleManager(msg.sender)) revert Registry_OnlyManager();
        _;
    }

    function _setManagerRole(address _address) private {
        _grantRole(MANAGER_ROLE, _address);
    }

    function hasRoleManager(address _address) public view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function createVault(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) public returns (address vaultAddress_) {
        if (vault[asset_].vaultAddress != address(0)) revert Registry_VaultAlreadyExists(vault[asset_].vaultAddress);

        vaultAddress_ = vaultFactory.createVault(msg.sender, asset_, name_, symbol_);

        emit Registry_VaultCreated(vaultAddress_, msg.sender);

        _setupVault(asset_, vaultAddress_);
    }

    // function vault(IERC20 asset_) public view returns (bool) {
    //     return vault[asset_].vaultAddress;
    // }

    function _setupVault(IERC20 asset_, address vaultAddress_) private {
        vault[asset_] = Vault({vaultAddress: vaultAddress_, isTrusted: false});
    }

    function trustVault(IERC20 asset_) public onlyManager {
        if (isVaultTrusted(asset_)) revert Registry_VaultAlreadyTrusted(vault[asset_].vaultAddress);

        vault[asset_].isTrusted = true;
        emit Registry_VaultTrusted(asset_);
    }

    function isVaultTrusted(IERC20 asset_) public view returns (bool) {
        return vault[asset_].isTrusted;
    }
}
