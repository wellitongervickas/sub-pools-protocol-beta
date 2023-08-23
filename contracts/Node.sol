// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Address} from '@openzeppelin/contracts/utils/Address.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {BaseAdapter} from './BaseAdapter.sol';
import {Registry} from './Registry.sol';
import {Vault} from './Vault.sol';
import 'hardhat/console.sol';

contract Node is BaseAdapter {
    using SafeERC20 for IERC20;
    using Address for address;

    struct Position {
        uint32 id;
        uint256[] amount;
    }

    Vault[] private _vaultsIn;
    Registry public immutable registry;

    uint32 private _latestPositionId;

    mapping(address => Position) private _position;

    event Node_PositionCreated(uint256[] amount_, address depositor_);

    constructor(address target_, Registry registry_) {
        registry = registry_;
        target = target_;

        _assetsIn = BaseAdapter(target).assetsIn();
        _setupAdapterAssetsVault();
    }

    function assetsIn() public view override returns (IERC20[] memory) {
        return _assetsIn;
    }

    function _setupAdapterAssetsVault() private {
        for (uint8 index = 0; index < _assetsIn.length; index++) {
            _vaultsIn.push(registry.getVault(_assetsIn[index]));
        }
    }

    function deposit(bytes memory data) public override {
        (uint256[] memory amount_, address depositor_) = abi.decode(data, (uint256[], address));

        _deposit(amount_, depositor_);
        _createPosition(depositor_, amount_);

        emit Node_PositionCreated(amount_, depositor_);
    }

    function _deposit(uint256[] memory amount_, address depositor_) private {
        _receiveFrom(amount_, depositor_);
        _depositTo(amount_);
    }

    function _receiveFrom(uint256[] memory amount_, address depositor_) private {
        for (uint8 index = 0; index < _vaultsIn.length; index++) {
            Vault(_vaultsIn[index]).withdraw(amount_[index], address(this), depositor_);
        }
    }

    function _depositTo(uint256[] memory amount_) private {
        address(target).functionDelegateCall(
            abi.encodeWithSelector(BaseAdapter.deposit.selector, abi.encode(amount_, address(this)))
        );
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
}
