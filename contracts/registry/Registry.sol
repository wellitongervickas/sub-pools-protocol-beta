// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';
import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryLib} from '../libraries/Registry.sol';
import {RegistryControl} from './RegistryControl.sol';
import {FractionLib} from '../libraries/Fraction.sol';

import '../libraries/Coder.sol' as Coder;

contract Registry is IRegistry, RegistryControl, Ownable {
    using SafeERC20 for IERC20;
    using RegistryLib for RegistryLib.Account;

    IStrategy public immutable strategy;

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier whenNotAccount(address _address) {
        if (_account(_address).id != 0) revert IRegistry.AlreadyJoined();
        _;
    }

    modifier checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) {
        _checkParentRequiredInitialDeposit(_accountAddress, _amount);
        _;
    }

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);

        join(
            address(0),
            _msgSender(),
            FractionLib.Fraction(0, 100),
            Coder.defaultRequiredInitialDeposit(_strategyMode())
        );
    }

    function join(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) public onlyRouter whenNotAccount(_accountAddress) {
        _setupAccount(
            _accountAddress,
            Coder.defaultInitialBalance(_strategyMode()),
            Coder.defaultAdditionalBalance(_strategyMode()),
            _fees,
            _parentAddress,
            _requiredInitialDeposit
        );

        emit IRegistry.Joined(_accountAddress);
    }

    function deposit(
        address _depositor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkParentRequiredInitialDeposit(_accountAddress, _amount) {
        _transferStrategyAssets(_depositor, _amount);
        _depositStrategyAssets(_amount);

        bytes memory _remainingAmount = _chargeParentFees(_accountAddress, _amount);
        _depositAccount(_accountAddress, _remainingAmount);

        emit IRegistry.Deposited(_accountAddress, _amount);
    }

    function _transferStrategyAssets(address _depositor, bytes memory _amount) private {
        if (_strategyMode() == Coder.Mode.Single) {
            address _tokenAddress = Coder.decodeSingleAddress(strategy.token());
            IERC20(_tokenAddress).safeTransferFrom(
                _depositor,
                address(strategy),
                Coder.decodeSingleAssetAmount(_amount)
            );
        } else {
            /// TODO
        }
    }

    function _depositStrategyAssets(bytes memory _amount) private {
        strategy.deposit(_amount);
    }

    function _chargeParentFees(address _accountAddress, bytes memory _amount) private returns (bytes memory) {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);

            if (_checkIsRootAccount(_account)) return Coder.encodeSingleAssetAmount(_decodedAmount);

            RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

            bytes memory _parentAdditionalBalance = _parent.additionalBalance;
            uint256 _decodedAdditionalBalance = Coder.decodeSingleAssetAmount(_parentAdditionalBalance);

            uint256 _feesAmount = _parent._calculateFees(_decodedAmount);
            uint256 _updatedAdditionalBalance = _feesAmount + _decodedAdditionalBalance;

            _additionalDepositAccount(_account.parent, Coder.encodeSingleAssetAmount(_updatedAdditionalBalance));

            return Coder.encodeSingleAssetAmount(_decodedAmount - _feesAmount);
        } else {
            (uint256 _decodedAmount1, uint256 _decodedAmount2) = Coder.decodeMultiAssetAmount(_amount);
            /// ToDo
            return Coder.encodeMultiAssetAmount(_decodedAmount1, _decodedAmount2);
        }
    }

    function _checkIsRootAccount(RegistryLib.Account storage _account) private view returns (bool) {
        return _account.id == 2;
    }

    function _checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);
            RegistryLib.Account storage _account = _account(_accountAddress);

            if (!_checkIsRootAccount(_account)) {
                RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

                uint256 _requiredAmount = Coder.decodeSingleAssetAmount(_parent.requiredInitialDeposit);
                if (_requiredAmount > 0 && _decodedAmount != _requiredAmount) revert IRegistry.InvalidInitialAmount();
            }
        } else {
            /// ToDo
        }
    }

    function _strategyMode() private view returns (Coder.Mode) {
        return strategy.mode();
    }
}
