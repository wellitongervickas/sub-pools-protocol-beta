// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IBaseAdapter} from '../interfaces/adapters/IBaseAdapter.sol';
import {VaultAdapter} from './VaultAdapter.sol';
import {VaultAccount} from './VaultAccount.sol';
import {VaultPosition} from './VaultPosition.sol';

contract Vault is IVault, VaultAdapter, VaultAccount, VaultPosition, Ownable {
    event Vault_Deposited(uint256 indexed positionId_, uint256[] amount_);

    constructor(IBaseAdapter adapter_) VaultAdapter(adapter_) {}

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    function deposit(address depositor_, uint256[] memory amount_) public override onlyRouter {
        super.deposit(depositor_, amount_);

        uint256 id = _createPosition(_createAccount(depositor_), amount_);

        emit Vault_Deposited(id, amount_);
    }
}
