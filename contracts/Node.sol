// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Vault} from './Vault.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Node {
    Vault[] private _vaultsIn;

    struct Position {
        address owner;
        uint256[] amount;
    }

    uint32 private _currentPositionId;
    mapping(uint32 => Position) private _positions;

    event Node_PositionCreated(uint32 positionId_, address depositor_, uint256[] amount_);

    constructor(Vault[] memory vaultsIn_) {
        _vaultsIn = vaultsIn_;
    }

    function vaultIn(uint8 index_) public view returns (Vault) {
        return _vaultsIn[index_];
    }

    function createPosition(uint256[] memory amount_, address depositor_) public returns (uint32 positionId) {
        _withdrawVaultAssets(amount_, depositor_);

        positionId = _setupPosition(_getPositionID(), depositor_, amount_);

        emit Node_PositionCreated(positionId, depositor_, amount_);
    }

    function _increasePositionId() private returns (uint32) {
        return _currentPositionId += 1;
    }

    function _getPositionID() private returns (uint32 positionId) {
        positionId = _increasePositionId();
    }

    function _setupPosition(uint32 positionId_, address owner_, uint256[] memory amount_) private returns (uint32) {
        _positions[positionId_] = Position({owner: owner_, amount: amount_});

        return positionId_;
    }

    function _withdrawVaultAssets(uint256[] memory amount_, address owner_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            vaultIn(index).withdraw(amount_[index], address(this), owner_);
        }
    }
}
