// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Vault} from './Vault.sol';
import {Router} from './Router.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';

contract Node {
    using Address for address;
    using SafeERC20 for IERC20;

    Router.Adapter public adapter;

    struct Position {
        uint32 id;
        uint256[] amounts;
    }

    uint32 private _latestPositionId;

    mapping(address => Position) private _position;

    event Node_PositionIncreased(uint256[] amounts_, address owner_);

    constructor(Router.Adapter memory adapter_) {
        adapter = adapter_;
    }

    function getAdapter() external view returns (Router.Adapter memory) {
        return adapter;
    }

    function deposit(uint256[] memory amount_, address owner_, bytes memory data_) external {
        _deposit(amount_, data_);

        if (hasPosition(owner_)) {
            _increasePositionAmount(amount_, owner_);
        } else {
            _createPosition(owner_, amount_);
        }

        emit Node_PositionIncreased(amount_, owner_);
    }

    function _deposit(uint256[] memory amount_, bytes memory data_) private {
        _receiveAssetsIn(amount_);
        _approveAssetsInToTargetIn(amount_);
        _callTargetInDeposit(data_);
        _removeTargetInAssetsInApproval();
    }

    function hasPosition(address owner_) public view returns (bool) {
        return _position[owner_].id > 0;
    }

    function _receiveAssetsIn(uint256[] memory amount_) private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            adapter.vaultsIn[i].withdraw(amount_[i], address(this), address(this));
        }
    }

    function _approveAssetsInToTargetIn(uint256[] memory amount_) private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _approveSpenderAssetAmount(adapter.vaultsIn[i].asset(), adapter.targetIn, amount_[i]);
        }
    }

    function _approveSpenderAssetAmount(address asset_, address spender_, uint256 amount_) private {
        IERC20(asset_).approve(spender_, amount_);
    }

    function _callTargetInDeposit(bytes memory data_) private {
        address(adapter.targetIn).functionCall(abi.encodePacked(adapter.depositFunctionSignature, data_));
    }

    function _removeTargetInAssetsInApproval() private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _approveSpenderAssetAmount(adapter.vaultsIn[i].asset(), adapter.targetIn, 0);
        }
    }

    function _createPosition(address owner_, uint256[] memory amounts_) private returns (Position memory) {
        return _position[owner_] = Position({id: _createPositionId(), amounts: amounts_});
    }

    function _createPositionId() private returns (uint32 positionId) {
        positionId = _increasePositionId();
    }

    function _increasePositionId() private returns (uint32) {
        return _latestPositionId += 1;
    }

    function _increasePositionAmount(uint256[] memory amount_, address owner_) private {
        harvest(owner_);

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _position[owner_].amounts[i] += amount_[i];
        }
    }

    function withdraw(uint256[] memory amount_, address owner_, bytes memory data_) external {
        _callAdapterWithdraw(data_);
        _decreasePositionAmount(amount_, owner_);
        _approveVaultToSpend(amount_);
        _depositAmountToVault(amount_, owner_);
        _removeVaultSpendApproval();
    }

    function _callAdapterWithdraw(bytes memory data_) private {
        address(adapter.targetIn).functionCall(abi.encodePacked(adapter.withdrawFunctionSignature, data_));
    }

    function _decreasePositionAmount(uint256[] memory amount_, address owner_) private {
        harvest(owner_);

        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _position[owner_].amounts[i] -= amount_[i];
        }
    }

    function _approveVaultToSpend(uint256[] memory amount_) private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _approveSpenderAssetAmount(adapter.vaultsIn[i].asset(), address(adapter.vaultsIn[i]), amount_[i]);
        }
    }

    function _depositAmountToVault(uint256[] memory amount_, address owner_) private {
        for (uint256 i = 0; i < adapter.vaultsOut.length; i++) {
            Vault vault = adapter.vaultsOut[i];
            vault.deposit(amount_[i], owner_);
        }
    }

    function _removeVaultSpendApproval() private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _approveSpenderAssetAmount(adapter.vaultsIn[i].asset(), address(adapter.vaultsIn[i]), 0);
        }
    }

    function harvest(address owner_) public {
        _callHarvestSelector();

        _approveVaultToSpendProfit();
        _depositAmountProfitToVault(owner_);
        _removeVaultProfitSpendApproval();
    }

    function _callHarvestSelector() private {
        address(adapter.targetIn).functionCall(abi.encodePacked(adapter.harvestFunctionSignature));
    }

    function _approveVaultToSpendProfit() private {
        for (uint256 i = 0; i < adapter.vaultsProfit.length; i++) {
            _approveSpenderAssetAmount(
                adapter.vaultsProfit[i].asset(),
                address(adapter.vaultsProfit[i]),
                IERC20(adapter.vaultsProfit[i].asset()).balanceOf(address(this))
            );
        }
    }

    function _depositAmountProfitToVault(address owner_) private {
        for (uint256 i = 0; i < adapter.vaultsProfit.length; i++) {
            Vault vault = adapter.vaultsProfit[i];
            vault.deposit(IERC20(adapter.vaultsProfit[i].asset()).balanceOf(address(this)), owner_);
        }
    }

    function _removeVaultProfitSpendApproval() private {
        for (uint256 i = 0; i < adapter.vaultsProfit.length; i++) {
            _approveSpenderAssetAmount(adapter.vaultsProfit[i].asset(), address(adapter.vaultsProfit[i]), 0);
        }
    }
}
