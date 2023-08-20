// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Vault} from './Vault.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Node {
    Vault[] private _vaultsIn;
    Vault[] private _vaultsOut;

    struct Position {
        uint32 id;
        uint256[] amount;
    }

    uint32 private _latestPositionId;

    mapping(address => Position) private _position;

    event Node_PositionCreated(uint256[] amount_, address depositor_);
    event Node_PositionRemoved(uint256[] amount_, address receiver_);

    constructor(Vault[] memory vaultsIn_, Vault[] memory vaultsOut_) {
        _vaultsIn = vaultsIn_;
        _vaultsOut = vaultsOut_;
    }

    function vaultIn(uint8 index_) public view returns (Vault) {
        return _vaultsIn[index_];
    }

    function vaultOut(uint8 index_) public view returns (Vault) {
        return _vaultsOut[index_];
    }

    function createPosition(uint256[] memory amount_, address depositor_) external {
        _withdrawVaultAssets(amount_, depositor_);
        _createPosition(depositor_, amount_);

        emit Node_PositionCreated(amount_, depositor_);
    }

    function _increasePositionId() private returns (uint32) {
        return _latestPositionId += 1;
    }

    function _createPositionId() private returns (uint32 positionId) {
        positionId = _increasePositionId();
    }

    function _createPosition(address owner_, uint256[] memory amount_) private returns (Position memory) {
        return _position[owner_] = Position({id: _createPositionId(), amount: amount_});
    }

    function _withdrawVaultAssets(uint256[] memory amount_, address depositor_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            vaultIn(index).withdraw(amount_[index], address(this), depositor_);
        }
    }

    function decreasePosition(uint256[] memory amount_, address receiver_) external {
        _decreasePosition(amount_, receiver_);
        _depositVaultAssets(amount_, receiver_);

        emit Node_PositionRemoved(amount_, receiver_);
    }

    function _decreasePosition(uint256[] memory amount_, address receiver_) private {
        uint256[] storage amount = _position[receiver_].amount;

        for (uint8 index = 0; index < amount_.length; index++) {
            amount[index] -= amount_[index];
        }
    }

    function _depositVaultAssets(uint256[] memory amount_, address receiver_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            Vault vaultOut_ = vaultOut(index);

            IERC20 token = IERC20(address(vaultOut_.asset()));

            SafeERC20.safeApprove(token, address(vaultOut_), amount_[index]);

            vaultOut_.deposit(amount_[index], receiver_);
        }
    }

    function position(address owner_) external view returns (Position memory) {
        return _position[owner_];
    }
}
