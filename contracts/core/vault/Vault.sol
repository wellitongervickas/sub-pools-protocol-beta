// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IVault} from '../interfaces/vault/IVault.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {VaultAccount} from './VaultAccount.sol';
import {VaultPosition} from './VaultPosition.sol';
import 'hardhat/console.sol';

contract Vault is IVault, VaultAccount, VaultPosition, Ownable {
    IStrategy public immutable strategy;

    event Vault_PositionAdded(uint256 indexed positionId_, bytes amount_);

    constructor(IStrategy strategy_) {
        strategy = strategy_;
    }

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    function addPosition(address parentAddress_, bytes memory amount_) external onlyRouter {
        // uint256 positionId = strategy.addPosition(amount_);
        // uint256[] memory amounts = abi.decode(amount_, (uint256[]));
        // console.log('a', amounts.length, amounts[0]);

        /// ToDO = deposit to registry
        uint256 id = _createPosition(_createAccount(msg.sender, parentAddress_), amount_);

        emit Vault_PositionAdded(id, amount_);
    }
}
