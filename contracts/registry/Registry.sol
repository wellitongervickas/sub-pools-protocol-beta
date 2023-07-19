// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IStrategy, StrategyType} from '../interfaces/strategy/IStrategy.sol';
import {IRegistry} from '../interfaces/registry/IRegistry.sol';
import {RegistryLib} from '../libraries/Registry.sol';
import {RegistryControl} from './RegistryControl.sol';
import {FractionLib} from '../libraries/Fraction.sol';

import 'hardhat/console.sol';

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
        join(address(0), _msgSender(), _defaultFractionFees(), _defaultEncodedRequiredInitialDeposit());
    }

    function _defaultFractionFees() private pure returns (FractionLib.Fraction memory) {
        return FractionLib.Fraction(0, 100);
    }

    function _defaultEncodedRequiredInitialDeposit() private pure returns (bytes memory) {
        return abi.encode(0);
    }

    function join(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) public onlyRouter whenNotAccount(_accountAddress) {
        _setupAccount(
            _accountAddress,
            _defaultEncodedInitialBalance(),
            _defaultEncodedAdditionalBalance(),
            _fees,
            _parentAddress,
            _requiredInitialDeposit
        );

        emit IRegistry.Joined(_accountAddress);
    }

    function _defaultEncodedInitialBalance() private pure returns (bytes memory) {
        return abi.encode(0);
    }

    function _defaultEncodedAdditionalBalance() private pure returns (bytes memory) {
        return abi.encode(0);
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
        uint256 _decodedAmount = _decodeAssetAmount(_amount);
        address _decodedTokenAddress = _decodeTokenAddress();
        IERC20(_decodedTokenAddress).safeTransferFrom(_depositor, address(strategy), _decodedAmount);
    }

    function _depositStrategyAssets(bytes memory _amount) private {
        strategy.deposit(_amount);
    }

    function _decodeAssetAmount(bytes memory _amount) private pure returns (uint256) {
        return abi.decode(_amount, (uint256));
    }

    function _chargeParentFees(address _accountAddress, bytes memory _amount) private returns (bytes memory) {
        uint256 _decodedAmount = _decodeAssetAmount(_amount);
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (!_checkIsRootAccount(_account)) {
            RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

            bytes memory _parentAdditionalBalance = _parent.additionalBalance;
            uint256 _decodedAdditionalBalance = _decodeAssetAmount(_parentAdditionalBalance);

            uint256 _feesAmount = _parent._calculateFees(_decodedAmount);
            uint256 _updatedAdditionalBalance = _feesAmount + _decodedAdditionalBalance;

            _additionalDepositAccount(_account.parent, abi.encode(_updatedAdditionalBalance));

            return abi.encode(_decodedAmount - _feesAmount);
        }

        return abi.encode(_decodedAmount);
    }

    function _decodeTokenAddress() private view returns (address) {
        return abi.decode(strategy.token(), (address));
    }

    function _checkIsRootAccount(RegistryLib.Account storage _account) private view returns (bool) {
        return _account.id == 2;
    }

    function _checkParentRequiredInitialDeposit(address _accountAddress, bytes memory _amount) internal view {
        uint256 _decodedAmount = _decodeAssetAmount(_amount);
        RegistryLib.Account storage _account = _account(_accountAddress);

        if (!_checkIsRootAccount(_account)) {
            RegistryLib.Account storage _parent = _parentAccount(_accountAddress);

            uint256 _requiredAmount = _decodeAssetAmount(_parent.requiredInitialDeposit);
            if (_requiredAmount > 0 && _decodedAmount != _requiredAmount) revert IRegistry.InvalidInitialAmount();
        }
    }
}
