// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import '../libraries/Constants.sol' as CONSTATNS;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryLib} from '../libraries/Registry.sol';
import {RegistryControl} from './RegistryControl.sol';
import {FractionLib} from '../libraries/Fraction.sol';
import {BytesLib} from '../libraries/Bytes.sol';
import {Manager} from '../manager/Manager.sol';
import {IProtocol} from '../interfaces/fee/IProtocol.sol';
import {RegistryPivot} from './RegistryPivot.sol';

contract Registry is IRegistry, RegistryPivot, RegistryControl, Ownable, Manager {
    using RegistryLib for RegistryLib.Account;
    using BytesLib for bytes;

    IProtocol public immutable override protocol;

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

    modifier checkParentMaxDeposit(address _accountAddress, bytes memory _amount) {
        _checkParentMaxDeposit(_accountAddress, _amount);
        _;
    }

    modifier checkAdditionalBalance(address _accountAddress, bytes memory _amount) {
        _checkAdditionalBalance(_accountAddress, _amount);
        _;
    }

    modifier checkInitialBalance(address _accountAddress, bytes memory _amount) {
        _checkInitialBalance(_accountAddress, _amount);
        _;
    }

    modifier onlyUnlockPeriod(address _accountAddress) {
        if (_checkIsRootAccount(_accountAddress) && _account(_accountAddress)._isLocked()) {
            revert IRegistry.LockPeriod();
        }

        if (_account(_account(_accountAddress).parent)._isLocked()) revert IRegistry.LockPeriod();
        _;
    }

    constructor(address _strategy, address _managerAddress, IProtocol _protocol) RegistryPivot(_strategy) {
        _setManagerRole(_managerAddress);
        protocol = _protocol;
    }

    function join(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) public onlyRouter whenNotAccount(_accountAddress) {
        _setupAccount(
            _accountAddress,
            CONSTATNS.DEFAULT_INITIAL_BALANCE(strategyMode()),
            CONSTATNS.DEFAULT_ADDITIONAL_BALANCE(strategyMode()),
            _fees,
            _parentAddress,
            _requiredInitialDeposit,
            CONSTATNS.DEFAULT_CASHBACK_BALANCE(strategyMode()),
            _maxDeposit,
            _lockPeriod
        );

        emit IRegistry.Joined(_accountAddress);
    }

    function deposit(
        address _depositor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkParentRequiredInitialDeposit(_accountAddress, _amount) {
        _deposit(_depositor, _amount);

        _account(_accountAddress)._setInitialBalance(
            _chargeParentJoinFees(_accountAddress, _chargeProtocolFees(_amount))
        );
    }

    function _chargeProtocolFees(bytes memory _amount) private returns (bytes memory) {
        FractionLib.Fraction memory _protocolFees = protocol.protocolFees();
        bytes memory _feesAmount = _amount.toFraction(strategyMode(), _protocolFees.value, _protocolFees.divider);

        _withdraw(protocol.treasuryAddress(), _feesAmount);

        return _amount.decrement(strategyMode(), _feesAmount);
    }

    function _chargeParentJoinFees(address _accountAddress, bytes memory _amount) private returns (bytes memory) {
        if (_checkIsRootAccount(_accountAddress)) return _amount;

        RegistryLib.Account memory _parent = _account(_account(_accountAddress).parent);

        bytes memory _fractionAmount = _amount.toFraction(strategyMode(), _parent.fees.value, _parent.fees.divider);
        _increaseAdditionalBalance(_account(_accountAddress).parent, _fractionAmount);

        bytes memory _remainingAmount = _amount.decrement(strategyMode(), _fractionAmount);
        _increaseCashbackBalance(_account(_accountAddress).parent, _remainingAmount);

        return _remainingAmount;
    }

    function _checkIsRootAccount(address _accountAddress) private view returns (bool) {
        return _account(_accountAddress).id == 1;
    }

    function _checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_checkIsRootAccount(_accountAddress)) return;

        if (
            !_amount.ifNotZeroIsEqual(strategyMode(), _account(_account(_accountAddress).parent).requiredInitialDeposit)
        ) {
            revert IRegistry.InvalidInitialAmount();
        }
    }

    function additionalDeposit(
        address _depositor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkParentMaxDeposit(_accountAddress, _amount) {
        _deposit(_depositor, _amount);

        _increaseAdditionalBalance(_accountAddress, _chargeProtocolFees(_amount));
    }

    function _checkParentMaxDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_checkIsRootAccount(_accountAddress)) return;

        if (
            _account(_accountAddress).additionalBalance.increment(strategyMode(), _amount).ifNotZeroExceeds(
                strategyMode(),
                _account(_account(_accountAddress).parent).maxDeposit
            )
        ) {
            revert IRegistry.ExceedsMaxDeposit();
        }
    }

    function _increaseAdditionalBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setAdditionalBalance(
            _account(_accountAddress).additionalBalance.increment(strategyMode(), _amount)
        );
    }

    function _increaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setCashbackBalance(
            _account(_accountAddress).cashbackBalance.increment(strategyMode(), _amount)
        );
    }

    function _decreaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setCashbackBalance(
            _account(_accountAddress).cashbackBalance.decrement(strategyMode(), _amount)
        );
    }

    function withdraw(
        address _requisitor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkAdditionalBalance(_accountAddress, _amount) {
        _decreaseAdditionalBalance(_accountAddress, _amount);
        _withdraw(_requisitor, _amount);
    }

    function _decreaseAdditionalBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setAdditionalBalance(
            _account(_accountAddress).additionalBalance.decrement(strategyMode(), _amount)
        );
    }

    function _checkAdditionalBalance(address _accountAddress, bytes memory _amount) private view {
        if (_amount.greaterThanAmount(strategyMode(), _account(_accountAddress).additionalBalance)) {
            revert IRegistry.InsufficientAdditionalBalance();
        }
    }

    function withdrawInitialBalance(
        address _requisitor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter onlyUnlockPeriod(_accountAddress) checkInitialBalance(_accountAddress, _amount) {
        _decreaseInitialBalance(_accountAddress, _amount);

        if (!_checkIsRootAccount(_accountAddress)) {
            _decreaseCashbackBalance(_account(_accountAddress).parent, _amount);
        }

        _withdraw(_requisitor, _amount);
    }

    function _checkInitialBalance(address _accountAddress, bytes memory _amount) private view {
        if (_amount.greaterThanAmount(strategyMode(), _account(_accountAddress).initialBalance)) {
            revert IRegistry.InsufficientInitialBalance();
        }
    }

    function _decreaseInitialBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setInitialBalance(
            _account(_accountAddress).initialBalance.decrement(strategyMode(), _amount)
        );
    }
}
