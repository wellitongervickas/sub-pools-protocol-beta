// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {VaultAdapter} from './VaultAdapter.sol';
import {VaultAccount} from './VaultAccount.sol';
import {VaultPosition} from './VaultPosition.sol';

contract Vault is IVault, VaultAdapter, VaultAccount, VaultPosition, Ownable {
    event Vault_PositionAdded(uint256 indexed positionId_, bytes amount_);

    constructor(IStrategy strategy_) VaultAdapter(strategy_) {}

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    function addPosition(bytes memory amount_, address parentAddress_) external onlyRouter {
        bytes memory shares = _deposit(msg.sender, amount_);
        uint256 id = _createPosition(_createAccount(msg.sender, parentAddress_), shares);

        emit Vault_PositionAdded(id, shares);
    }
}
