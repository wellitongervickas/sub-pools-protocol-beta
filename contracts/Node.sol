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

    event Node_PositionOpened(uint256[] amounts_, address owner_);
    event Node_PositionIncreased(uint256[] amounts_, address owner_);

    constructor(Router.Adapter memory adapter_) {
        adapter = adapter_;
    }

    function getAdapter() external view returns (Router.Adapter memory) {
        return adapter;
    }

    /** should be called once? */
    function openPosition(uint256[] memory amount_, address owner_, bytes memory data_) external {
        _deposit(amount_, data_);
        _createPosition(owner_, amount_);

        emit Node_PositionOpened(amount_, owner_);
    }

    function _deposit(uint256[] memory amount_, bytes memory data_) private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            Vault vault = adapter.vaultsIn[i];

            vault.withdraw(amount_[i], address(this), address(this));

            IERC20(vault.asset()).approve(adapter.targetAddress, amount_[i]);
        }

        address(adapter.targetAddress).functionCall(abi.encodePacked(adapter.functionSelector, data_));
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

    function increasePosition(uint256[] memory amount_, address owner_, bytes memory data_) external {
        _deposit(amount_, data_);
        _increasePositionAmount(amount_, owner_);

        emit Node_PositionIncreased(amount_, owner_);
    }

    function _increasePositionAmount(uint256[] memory amount_, address owner_) private {
        for (uint256 i = 0; i < adapter.vaultsIn.length; i++) {
            _position[owner_].amounts[i] += amount_[i];
        }
    }
}
