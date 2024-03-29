// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterControl} from './RouterControl.sol';
import {Node, INode} from '../node/Node.sol';
import {FractionLib} from '../libraries/Fraction.sol';
import {RouterPivot} from './RouterPivot.sol';
import {Manager, IManager} from '../manager/Manager.sol';
import {IProtocol} from '../interfaces/fee/IProtocol.sol';

contract Router is IRouter, RouterPivot, Manager, RouterControl {
    IProtocol public override protocol;

    constructor(IProtocol _protocol) {
        protocol = _protocol;
        _setManagerRole(msg.sender);
    }

    function registry(address _strategyAddress) external onlyManager(_strategyAddress) returns (address) {
        return _createRegistry(_strategyAddress, msg.sender, protocol);
    }

    function setProtocol(IProtocol _protocol) external onlyManager(address(this)) {
        protocol = _protocol;
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

    function additionalDeposit(address _nodeAddress, bytes memory _amount) external onlyManager(_nodeAddress) {
        _registryAdditionalDeposit(INode(_nodeAddress).registry(), _nodeAddress, _amount);
    }

    function withdraw(address _nodeAddress, bytes memory _amount) external onlyManager(_nodeAddress) {
        _registryWithdraw(INode(_nodeAddress).registry(), _nodeAddress, _amount);
    }

    function withdrawInitialBalance(address _nodeAddress, bytes memory _amount) external onlyManager(_nodeAddress) {
        _registryWithdrawInitialBalance(INode(_nodeAddress).registry(), _nodeAddress, _amount);
    }
}
