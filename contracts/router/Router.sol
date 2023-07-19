// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouter} from '../interfaces/router/IRouter.sol';
import {RouterControl} from './RouterControl.sol';
import {Node} from '../node/Node.sol';
import {FractionLib} from '../libraries/Fraction.sol';
import {RouterPivot} from './RouterPivot.sol';

contract Router is IRouter, RouterPivot, RouterControl {
    function registry(address _strategyAddress) external returns (address) {
        return _createRegistry(_strategyAddress);
    }

    function create(
        address _registryAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) external onlyValidRegistry(_registryAddress) returns (address) {
        address _nodeAddress = _createRootNode(_registryAddress, _invitedAddresses);

        _setupAccount(address(this), _registryAddress, _nodeAddress, _initialAmount, _fees, _requiredInitialDeposit);
        return _nodeAddress;
    }

    function join(
        address _parentAddress,
        address[] memory _invitedAddresses,
        bytes memory _initialAmount,
        FractionLib.Fraction memory _fees,
        bytes memory _requiredInitialDeposit
    ) external returns (address) {
        Node _parent = Node(_parentAddress);

        address _parentRegistry = _parent.registry();
        address _nodeAddress = _deployNode(address(_parent), msg.sender, _invitedAddresses, _parentRegistry);

        _parent.join(_nodeAddress, msg.sender);
        _setupAccount(_parentAddress, _parentRegistry, _nodeAddress, _initialAmount, _fees, _requiredInitialDeposit);

        return _nodeAddress;
    }

    function additionalDeposit(address _nodeAddress, bytes memory _additionalAmount) external {
        Node _node = Node(_nodeAddress);
        address _registryAddress = _node.registry();

        _additionalDeposit(_registryAddress, _nodeAddress, _additionalAmount);
    }
}
