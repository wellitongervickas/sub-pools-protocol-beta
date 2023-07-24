// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterControl} from './RouterControl.sol';
import {Node, INode} from '../node/Node.sol';
import {FractionLib} from '../libraries/Fraction.sol';
import {RouterPivot} from './RouterPivot.sol';
import {IManager} from '../manager/Manager.sol';

contract Router is IRouter, RouterPivot, RouterControl {
    modifier onlyManager(address _address) {
        if (!IManager(_address).hasRoleManager(msg.sender)) revert IManager.InvalidManager();
        _;
    }

    function registry(address _strategyAddress) external onlyManager(_strategyAddress) returns (address) {
        return _createRegistry(_strategyAddress, msg.sender);
    }

    function create(
        address _registryAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) external onlyValidRegistry(_registryAddress) onlyManager(_registryAddress) returns (address) {
        address _nodeAddress = _createRootNode(_registryAddress, _invitedAddresses);

        _setupAccount(
            address(this),
            _registryAddress,
            _nodeAddress,
            _initialAmount,
            _fees,
            _requiredInitialDeposit,
            _maxDeposit,
            _lockPeriod
        );

        return _nodeAddress;
    }

    function join(
        address _parentAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit,
        bytes memory _maxDeposit,
        uint256 _lockPeriod
    ) external returns (address) {
        INode _parent = INode(_parentAddress);

        address _parentRegistry = _parent.registry();
        address _nodeAddress = _deployNode(address(_parent), msg.sender, _invitedAddresses, _parentRegistry);

        _parent.join(_nodeAddress, msg.sender);

        _setupAccount(
            _parentAddress,
            _parentRegistry,
            _nodeAddress,
            _initialAmount,
            _fees,
            _requiredInitialDeposit,
            _maxDeposit,
            _lockPeriod
        );

        return _nodeAddress;
    }

    function additionalDeposit(
        address _nodeAddress,
        bytes memory _additionalAmount
    ) external onlyManager(_nodeAddress) {
        _additionalDeposit(INode(_nodeAddress).registry(), _nodeAddress, _additionalAmount);
    }

    function withdraw(address _nodeAddress, bytes memory _additionalAmount) external onlyManager(_nodeAddress) {
        _withdraw(INode(_nodeAddress).registry(), _nodeAddress, _additionalAmount);
    }

    function withdrawInitialBalance(
        address _nodeAddress,
        bytes memory _additionalAmount
    ) external onlyManager(_nodeAddress) {
        _withdrawInitialBalance(INode(_nodeAddress).registry(), _nodeAddress, _additionalAmount);
    }
}
