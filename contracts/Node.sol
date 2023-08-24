// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {BaseAdapter} from './BaseAdapter.sol';
import {Registry} from './Registry.sol';
import {Vault} from './Vault.sol';
import 'hardhat/console.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract Node is BaseAdapter {
    using SafeERC20 for IERC20;
    using Address for address;

    struct Position {
        uint32 id;
        uint256[] amounts;
    }

    Vault[] private _vaultsIn;
    Registry public immutable registry;

    uint32 private _latestPositionId;

    mapping(address => Position) private _position;

    event Node_PositionCreated(uint256[] amounts_, address depositor_);

    constructor(address target_, Registry registry_) {
        registry = registry_;
        target = target_;
        _assetsIn = BaseAdapter(target).assetsIn();

        _setupAdapterAssetsVault();
    }

    function _setupAdapterAssetsVault() private {
        for (uint8 index = 0; index < assetsIn().length; index++) {
            _vaultsIn.push(registry.getVault(assetsIn()[index]));
        }
    }

    function deposit(bytes memory data) public override {
        (uint256[] memory amounts_, address depositor_, bytes memory adapterData_) = abi.decode(
            data,
            (uint256[], address, bytes)
        );

        _receiveFrom(amounts_, depositor_);
        _approveTarget(amounts_);
        _depositTo(adapterData_);
        _createPosition(depositor_, amounts_);

        emit Node_PositionCreated(amounts_, depositor_);
    }

    function _receiveFrom(uint256[] memory amounts_, address depositor_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            Vault(_vaultsIn[index]).withdraw(amounts_[index], address(this), depositor_);
        }
    }

    function _approveTarget(uint256[] memory amounts_) private {
        for (uint8 index = 0; index < _assetsIn.length; index++) {
            _assetsIn[index].safeApprove(BaseAdapter(target).target(), amounts_[index]);
        }
    }

    function _depositTo(bytes memory adapterData_) private {
        address(target).functionDelegateCall(abi.encodeWithSelector(BaseAdapter.deposit.selector, adapterData_));
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
}
