// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {Vault} from './Vault.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Node is Ownable {
    Vault[] private _vaults;

    event Node_PositionCreated(uint32 positionId_, address depositor_, uint256 amount_);

    constructor(Vault[] memory vaults_) {
        _vaults = vaults_;
    }

    function vault(uint8 index_) external view returns (Vault) {
        return _vaults[index_];
    }

    function createPosition(uint256 amount_, address depositor_) public onlyOwner returns (uint32 positionId) {
        _depositVaultShares(amount_, depositor_);

        positionId = 1;

        emit Node_PositionCreated(positionId, depositor_, amount_);

        _withdrawVaultAssets(amount_);
    }

    function _depositVaultShares(uint256 amount_, address depositor_) private {
        for (uint8 i = 0; i < _vaults.length; i++) {
            SafeERC20.safeTransferFrom(_vaults[i], depositor_, address(this), amount_);
        }
    }

    function _withdrawVaultAssets(uint256 amount_) private {
        for (uint8 i = 0; i < _vaults.length; i++) {
            _vaults[i].withdraw(amount_, address(this), address(this));
        }
    }
}
