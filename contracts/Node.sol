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
    event Node_PositionDecreased(uint256[] amount_, address receiver_);
    event Node_PositionIncreased(uint256[] amount_, address depositor_);
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
        _withdrawVaultInAssets(amount_, depositor_);
        _createPosition(depositor_, amount_);

        emit Node_PositionCreated(amount_, depositor_);
    }

    function _withdrawVaultInAssets(uint256[] memory amount_, address depositor_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            Vault vaultIn_ = vaultIn(index);
            _receiveFromVault(vaultIn_, amount_[index], depositor_);
        }
    }

    function _receiveFromVault(Vault vault_, uint256 amount_, address depositor_) private {
        vault_.withdraw(amount_, address(this), depositor_);
    }

    function _createPosition(address owner_, uint256[] memory amount_) private returns (Position memory) {
        return _position[owner_] = Position({id: _createPositionId(), amount: amount_});
    }

    function _createPositionId() private returns (uint32 positionId) {
        positionId = _increasePositionId();
    }

    function _increasePositionId() private returns (uint32) {
        return _latestPositionId += 1;
    }

    function position(address owner_) external view returns (Position memory) {
        return _position[owner_];
    }

    function decreasePosition(uint256[] memory amount_, address receiver_) external {
        _decreasePosition(amount_, receiver_);
        _depositVaultOutAssets(amount_, receiver_);

        emit Node_PositionDecreased(amount_, receiver_);
    }

    function _decreasePosition(uint256[] memory amount_, address receiver_) private {
        uint256[] storage amount = _position[receiver_].amount;

        for (uint8 index = 0; index < amount_.length; index++) {
            amount[index] -= amount_[index];
        }
    }

    function _depositVaultOutAssets(uint256[] memory amount_, address receiver_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            Vault vaultOut_ = vaultOut(index);

            _approveVaultOutAssets(vaultOut_, amount_[index]);
            _depositToVault(vaultOut_, amount_[index], receiver_);
        }
    }

    function _approveVaultOutAssets(Vault vault, uint256 amount_) private {
        IERC20 token = IERC20(address(vault.asset()));
        SafeERC20.safeApprove(token, address(vault), amount_);
    }

    function _depositToVault(Vault vault_, uint256 amount_, address receiver_) private {
        vault_.deposit(amount_, receiver_);
    }

    function increasePosition(uint256[] memory amount_, address depositor_) external {
        _withdrawVaultInAssets(amount_, depositor_);
        _increasePosition(amount_, depositor_);

        emit Node_PositionIncreased(amount_, depositor_);
    }

    function _increasePosition(uint256[] memory amount_, address receiver_) private {
        uint256[] storage amount = _position[receiver_].amount;

        for (uint8 index = 0; index < amount_.length; index++) {
            amount[index] += amount_[index];
        }
    }

    function removePosition(address receiver_) external {
        Position memory position_ = _position[receiver_];

        _depositVaultOutAssets(position_.amount, receiver_);
        _removePosition(receiver_);

        emit Node_PositionRemoved(position_.amount, receiver_);
    }

    function _removePosition(address receiver_) private {
        delete _position[receiver_];
    }
}
