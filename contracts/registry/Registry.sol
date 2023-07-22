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

    modifier onlyParentUnlockedPeriod(address _accountAddress) {
        if (_account(_account(_accountAddress).parent)._isLocked()) revert IRegistry.LockPeriod();
        _;
    }

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);
    }

    function _strategyMode() private view returns (Coder.Mode) {
        return strategy.mode();
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
            Coder.defaultInitialBalance(_strategyMode()),
            Coder.defaultAdditionalBalance(_strategyMode()),
            _fees,
            _parentAddress,
            _requiredInitialDeposit,
            Coder.defaultCashbackBalance(_strategyMode()),
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
        strategy.deposit(_depositor, _amount);

        _account(_accountAddress)._setInitialBalance(_chargeParentDepositFees(_accountAddress, _amount));

        emit IRegistry.Deposited(_accountAddress, _amount);
    }

    function _chargeParentDepositFees(address _accountAddress, bytes memory _amount) private returns (bytes memory) {
        if (_checkIsRootAccount(_accountAddress)) return _amount;

        RegistryLib.Account memory _parent = _account(_account(_accountAddress).parent);

        bytes memory _feesAmount = Coder.encodeAssetDecrementFraction(
            _strategyMode(),
            _parent.fees.value,
            _parent.fees.divider,
            _amount
        );

        _increaseAdditionalBalance(_account(_accountAddress).parent, _feesAmount);

        bytes memory _remainingAmount = Coder.encodeAssetDecrement(_strategyMode(), _amount, _feesAmount);
        _increaseCashbackBalance(_account(_accountAddress).parent, _remainingAmount);

        return _remainingAmount;
    }

    function _checkIsRootAccount(address _accountAddress) private view returns (bool) {
        return _account(_accountAddress).id == 1;
    }

    function _checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_checkIsRootAccount(_accountAddress)) return;

        if (
            !Coder.checkAssetsEqualAmount(
                _strategyMode(),
                _amount,
                _account(_account(_accountAddress).parent).requiredInitialDeposit
            )
        ) {
            revert IRegistry.InvalidInitialAmount();
        }
    }

    function additionalDeposit(
        address _depositor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkParentMaxDeposit(_accountAddress, _amount) {
        strategy.deposit(_depositor, _amount);

        _increaseAdditionalBalance(_accountAddress, _amount);

        emit IRegistry.Deposited(_accountAddress, _amount);
    }

    function _checkParentMaxDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_checkIsRootAccount(_accountAddress)) return;

        if (
            Coder.checkAssetsExceedsAmount(
                _strategyMode(),
                Coder.encodeAssetIncrement(_strategyMode(), _account(_accountAddress).additionalBalance, _amount),
                _account(_account(_accountAddress).parent).maxDeposit
            )
        ) {
            revert IRegistry.ExceedsMaxDeposit();
        }
    }

    function _increaseAdditionalBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setAdditionalBalance(
            Coder.encodeAssetIncrement(_strategyMode(), _account(_accountAddress).additionalBalance, _amount)
        );
    }

    function _increaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setCashbackBalance(
            Coder.encodeAssetIncrement(_strategyMode(), _account(_accountAddress).cashbackBalance, _amount)
        );
    }

    function _decreaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setCashbackBalance(
            Coder.encodeAssetDecrement(_strategyMode(), _account(_accountAddress).cashbackBalance, _amount)
        );
    }

    function withdraw(
        address _requisitor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter checkAdditionalBalance(_accountAddress, _amount) {
        _decreaseAdditionalBalance(_accountAddress, _amount);

        strategy.withdraw(_requisitor, _amount);

        emit IRegistry.Withdrew(_accountAddress, _amount);
    }

    function _decreaseAdditionalBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setAdditionalBalance(
            Coder.encodeAssetDecrement(_strategyMode(), _account(_accountAddress).additionalBalance, _amount)
        );
    }

    function _checkAdditionalBalance(address _accountAddress, bytes memory _amount) private view {
        if (Coder.checkAssetsGreaterThanAmount(_strategyMode(), _amount, _account(_accountAddress).additionalBalance)) {
            revert IRegistry.InsufficientAdditionalBalance();
        }
    }

    function withdrawInitialBalance(
        address _requisitor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter onlyParentUnlockedPeriod(_accountAddress) checkInitialBalance(_accountAddress, _amount) {
        _decreaseInitialBalance(_accountAddress, _amount);

        if (!_checkIsRootAccount(_accountAddress)) {
            _decreaseCashbackBalance(_account(_accountAddress).parent, _amount);
        }

        strategy.withdraw(_requisitor, _amount);

        emit IRegistry.Withdrew(_accountAddress, _amount);
    }

    function _checkInitialBalance(address _accountAddress, bytes memory _amount) private view {
        if (Coder.checkAssetsGreaterThanAmount(_strategyMode(), _amount, _account(_accountAddress).initialBalance)) {
            revert IRegistry.InsufficientInitialBalance();
        }
    }

    function _decreaseInitialBalance(address _accountAddress, bytes memory _amount) private {
        _account(_accountAddress)._setInitialBalance(
            Coder.encodeAssetDecrement(_strategyMode(), _account(_accountAddress).initialBalance, _amount)
        );
    }
}
