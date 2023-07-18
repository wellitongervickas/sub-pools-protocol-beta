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

contract Registry is IRegistry, RegistryControl, Ownable {
    using SafeERC20 for IERC20;

    IStrategy public immutable strategy;

    modifier onlyRouter() {
        _checkOwner();
        _;
    }

    modifier whenNotAccount(address _address) {
        if (accounts(_address).id != 0) revert AlreadyJoined();
        _;
    }

    constructor(address _strategy) {
        strategy = IStrategy(_strategy);
        setupAccount(_msgSender(), _msgSender(), FractionLib.Fraction(0, 0));
    }

    function setupAccount(
        address _parentAddress,
        address _accountAddress,
        FractionLib.Fraction memory _fees
    ) public onlyRouter whenNotAccount(_accountAddress) {
        _setupAccount(_parentAddress, _accountAddress, _fees);
        emit IRegistry.Joined(_accountAddress);
    }

    function deposit(address _from, address _accountAddress, bytes memory _initialAmount) external onlyRouter {
        _depositStrategy(_from, _initialAmount);
        _depositAccount(_accountAddress, _initialAmount);

        emit IRegistry.Deposited(_accountAddress, _initialAmount);
    }

    function _depositStrategy(address _from, bytes memory _initialAmount) private {
        _transferSingleTokenStrategy(_from, _initialAmount);
        strategy.deposit(_initialAmount);
    }

    function _transferSingleTokenStrategy(address _from, bytes memory _initialAmount) private {
        address _decodedTokenAddress = abi.decode(strategy.token(), (address));
        uint256 _decodedAmount = abi.decode(_initialAmount, (uint256));
        IERC20(_decodedTokenAddress).safeTransferFrom(_from, address(strategy), _decodedAmount);
    }
}
