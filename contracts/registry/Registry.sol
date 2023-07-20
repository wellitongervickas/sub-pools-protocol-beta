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

    modifier _checkInitialBalance(address _accountAddress, bytes memory _amount) {
        __checkInitialBalance(_accountAddress, _amount);
        _;
    }

    modifier onlyParentUnlockedPeriod(address _accountAddress) {
        if (_parentAccount(_accountAddress)._isLocked()) revert IRegistry.LockPeriod();
        _;
    }

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);

        join(
            address(0),
            _msgSender(),
            FractionLib.Fraction(0, 100),
            Coder.defaultRequiredInitialDeposit(_strategyMode()),
            Coder.defaultMaxDeposit(_strategyMode()),
            0 // lockperiod
        );
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

        bytes memory _remainingAmount = _chargeParentDepositFees(_accountAddress, _amount);
        accounts[_accountAddress]._setAccountBalance(_remainingAmount);

        emit IRegistry.Deposited(_accountAddress, _amount);
    }

    function _chargeParentDepositFees(address _accountAddress, bytes memory _amount) private returns (bytes memory) {
        if (_checkIsRootAccount(_accountAddress)) return _amount;

        RegistryLib.Account storage _account = _account(_accountAddress);
        RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);
            bytes memory _feesAmount = Coder.encodeSingleAssetAmount(_parent._calculateFees(_decodedAmount));

            _increaseAdditionalBalance(_account.parent, _feesAmount);

            bytes memory _remainingAmount = Coder.encodeSingleAssetDecrement(_amount, _feesAmount);
            _increaseCashbackBalance(_account.parent, _remainingAmount);

            return _remainingAmount;
        } else {
            /// ToDo
            return _amount;
        }
    }

    function _checkIsRootAccount(address _accountAddress) private view returns (bool) {
        return _account(_accountAddress).id == 2;
    }

    function _checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) private view {
        if (_checkIsRootAccount(_accountAddress)) return;
        RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);
            uint256 _requiredAmount = Coder.decodeSingleAssetAmount(_parent.requiredInitialDeposit);

            if (_requiredAmount > 0 && _decodedAmount != _requiredAmount) revert IRegistry.InvalidInitialAmount();
        } else {
            /// ToDo
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

        RegistryLib.Account storage _account = _account(_accountAddress);
        RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _maxAmount = Coder.decodeSingleAssetAmount(_parent.maxDeposit);
            uint256 _subTotal = Coder.decodeSingleAssetIncrement(_account.additionalBalance, _amount);

            if (_maxAmount > 0 && _subTotal > _maxAmount) revert IRegistry.ExceedsMaxDeposit();
        } else {
            /// ToDo
        }
    }

    function _increaseAdditionalBalance(address _accountAddress, bytes memory _amount) private {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            accounts[_accountAddress]._setAdditionalBalance(
                Coder.encodeSingleAssetIncrement(_account.additionalBalance, _amount)
            );
        } else {
            /// TODO
        }
    }

    function _increaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            accounts[_accountAddress]._setCashbackBalance(
                Coder.encodeSingleAssetIncrement(_account.cashbackBalance, _amount)
            );
        } else {
            /// TODO
        }
    }

    function _decreaseCashbackBalance(address _accountAddress, bytes memory _amount) private {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            accounts[_accountAddress]._setCashbackBalance(
                Coder.encodeSingleAssetDecrement(_account.cashbackBalance, _amount)
            );
        } else {
            /// TODO
        }
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
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            accounts[_accountAddress]._setAdditionalBalance(
                Coder.encodeSingleAssetDecrement(_account.additionalBalance, _amount)
            );
        } else {
            /// TODO
        }
    }

    function _checkAdditionalBalance(address _accountAddress, bytes memory _amount) private view {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedAdditionalBalance = Coder.decodeSingleAssetAmount(_account.additionalBalance);
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);

            if (_decodedAmount > _decodedAdditionalBalance) revert IRegistry.InsufficientAdditionalBalance();
        } else {
            /// TODO
        }
    }

    function withdrawInitialBalance(
        address _requisitor,
        address _accountAddress,
        bytes memory _amount
    ) external onlyRouter onlyParentUnlockedPeriod(_accountAddress) _checkInitialBalance(_accountAddress, _amount) {
        _decreaseInitialBalance(_accountAddress, _amount);

        RegistryLib.Account storage _account = _account(_accountAddress);

        if (!_checkIsRootAccount(_accountAddress)) {
            _decreaseCashbackBalance(_account.parent, _amount);
        }

        strategy.withdraw(_requisitor, _amount);

        emit IRegistry.Withdrew(_accountAddress, _amount);
    }

    function __checkInitialBalance(address _accountAddress, bytes memory _amount) private view {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            uint256 _decodedInitialBalance = Coder.decodeSingleAssetAmount(_account.initialBalance);
            uint256 _decodedAmount = Coder.decodeSingleAssetAmount(_amount);

            if (_decodedAmount > _decodedInitialBalance) revert IRegistry.InsufficientInitialBalance();
        } else {
            /// TODO
        }
    }

    function _decreaseInitialBalance(address _accountAddress, bytes memory _amount) private {
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (_strategyMode() == Coder.Mode.Single) {
            accounts[_accountAddress]._setAccountBalance(
                Coder.encodeSingleAssetDecrement(_account.initialBalance, _amount)
            );
        } else {
            /// TODO
        }
    }
}
