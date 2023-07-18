// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IRouterControl} from '../interfaces/router/IRouterControl.sol';
import {Node} from '../node/Node.sol';
import {NodeControl} from '../node/NodeControl.sol';
import {Registry} from '../registry/Registry.sol';
import {IStrategy, StrategyType} from '../interfaces/strategy/IStrategy.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

contract RouterControl is IRouterControl, NodeControl {
    using SafeERC20 for IERC20;

    function _createRegistry(address _strategyAddress) internal returns (address) {
        address _registryAddress = address(new Registry(_strategyAddress));

        emit IRouterControl.RegistryCreated(_registryAddress);

        return _registryAddress;
    }

    function _createRootNode(address[] memory _invitedAddresses, address _registryAddress) internal returns (address) {
        address _nodeAddress = _deployNode(address(this), msg.sender, _invitedAddresses, _registryAddress);
        _setupNode(_nodeAddress, msg.sender);

        return _nodeAddress;
    }

    function _deployNode(
        address _parentAddress,
        address _managerAddress,
        address[] memory _invitedAddresses,
        address _registryAddress
    ) internal returns (address) {
        Node _node = new Node(_parentAddress, _managerAddress, _invitedAddresses, _registryAddress);
        address _nodeAddress = address(_node);

        emit IRouterControl.NodeCreated(_nodeAddress);

        return _nodeAddress;
    }

    function _setupRegistryAccount(address _registryAddress, address _nodeAddress, bytes memory _amount) internal {
        Registry _registry = Registry(_registryAddress);

        _computeRegistrySetup(_registry, _nodeAddress);
        // _computeRegistryTransfer(_registry, _amount);
        _computeRegistryDeposit(_registry, _nodeAddress, _amount);

        emit IRouterControl.RegistryJoined(_registryAddress, _nodeAddress, _amount);
    }

    function _computeRegistrySetup(Registry _registry, address _nodeAddress) internal {
        _registry.setupAccount(_nodeAddress);
    }

    // function _computeRegistryTransfer(Registry _registry, bytes memory _amount) internal {
    //     IStrategy _strategy = _registry.strategy();

    //     if (_strategy.strategyType() == StrategyType.Single) {
    //         address _decodedTokenAddress = abi.decode(_strategy.token(), (address));
    //         uint256 _decodedAmount = abi.decode(_amount, (uint256));

    //         IERC20(_decodedTokenAddress).safeTransferFrom(msg.sender, address(_strategy), _decodedAmount);
    //     } else {
    //         (address _decodedToken1Address, address _decodedToken2Address) = abi.decode(
    //             _strategy.token(),
    //             (address, address)
    //         );

    //         (uint256 _decodedAmount1, uint256 _decodedAmount2) = abi.decode(_amount, (uint256, uint256));

    //         IERC20(_decodedToken1Address).safeTransferFrom(msg.sender, address(_strategy), _decodedAmount1);
    //         IERC20(_decodedToken2Address).safeTransferFrom(msg.sender, address(_strategy), _decodedAmount2);
    //     }
    // }

    function _computeRegistryDeposit(Registry _registry, address _nodeAddress, bytes memory _amount) internal {
        _registry.deposit(_nodeAddress, _amount);
    }
}
