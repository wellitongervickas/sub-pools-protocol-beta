// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Vault} from './Vault.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Node {
    Vault[] private _vaultsIn;

    struct Position {
        address depositor;
        uint256[] balance;
    }

    mapping(address => Position) private _positions;

    event Node_PositionCreated(uint32 positionId_, address depositor_, uint256[] amount_);

    constructor(Vault[] memory vaultsIn_) {
        _vaultsIn = vaultsIn_;
    }

    function vaultIn(uint8 index_) public view returns (Vault) {
        return _vaultsIn[index_];
    }

    function createPosition(uint256[] memory amount_, address depositor_) public returns (uint32 positionId) {
        _depositVaultShares(amount_, depositor_);

        positionId = 1;

        emit Node_PositionCreated(positionId, depositor_, amount_);

        _withdrawVaultAssets(amount_);
    }

    function _depositVaultShares(uint256[] memory amount_, address depositor_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            SafeERC20.safeTransferFrom(_vaultsIn[index], depositor_, address(this), amount_[index]);
        }
    }

    function _withdrawVaultAssets(uint256[] memory amount_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            vaultIn(index).withdraw(amount_[index], address(this), address(this));
        }
    }
}
