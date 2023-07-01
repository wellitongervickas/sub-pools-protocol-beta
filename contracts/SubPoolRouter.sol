// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {SubPool} from './SubPool.sol';
import {SubPoolNode} from './SubPoolNode.sol';
import {FractionLib} from './lib/Fraction.sol';
import {ISubPoolRouter, ISubPoolRouter} from './interfaces/ISubPoolRouter.sol';

contract SubPoolRouter is ISubPoolRouter, SubPool {
    /// @dev check if the caller is the manager of the node
    modifier onlyNodeManager(address _nodeAddress) {
        (address _managerAddress, , , ) = SubPoolNode(_nodeAddress).manager();
        if (_managerAddress != msg.sender) revert ISubPoolRouter.NotNodeManager();
        _;
    }

    /// @inheritdoc ISubPoolRouter
    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount
    ) external returns (address) {
        SubPoolNode _node = new SubPoolNode(
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount
        );

        address _nodeAddress = address(_node);
        uint256 _id = _setupNode(_nodeAddress, msg.sender, _amount);

        _setupNodeParent(_node, address(this));

        emit NodeCreated(_nodeAddress, _id, _amount);
        return _nodeAddress;
    }

    /// @inheritdoc ISubPoolRouter
    function join(
        address _parentNodeAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount
    ) external returns (address) {
        SubPoolNode _parentNode = SubPoolNode(_parentNodeAddress);

        SubPoolNode _node = new SubPoolNode(
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount
        );

        address _nodeAddress = address(_node);
        /// @dev join as children node to parent node
        uint256 _nodeId = _parentNode.join(_nodeAddress, _amount);

        _setupNodeParent(_node, _parentNodeAddress);

        emit NodeJoined(_nodeAddress, _nodeId, _amount);
        return _nodeAddress;
    }

    /// @dev setup node parent of node
    function _setupNodeParent(SubPoolNode _node, address _parentNodeAddress) internal {
        _node.setParent(_parentNodeAddress);
    }

    /// @dev only children node can call this function
    function withdraw(uint256 _amount) public override OnlyNode(msg.sender) {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    /// @dev only children node can call this function
    function cashback(uint256 _amount) public override OnlyNode(msg.sender) {
        super.cashback(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    /// @dev only children node can call this function
    function deposit(uint256 _amount) public override OnlyNode(msg.sender) {
        super.deposit(_amount);
        emit ManagerDeposited(msg.sender, _amount);
    }

    /// @notice additional deposit to children node balance
    function additionalDeposit(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        /// @dev if parent is not router, call node additional deposit
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).additionalDeposit(_amount);
        }

        _increaseNodeBalance(_nodeAddress, _amount);

        emit ManagerDeposited(_nodeAddress, _amount);
    }

    /// @notice withdraw  to children node balance
    function withdrawBalance(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        /// @dev if parent is not router, call node withdraw balance
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).withdrawBalance(_amount);
        }

        _decreaseNodeBalance(_nodeAddress, _amount);

        emit ManagerWithdrew(_nodeAddress, _amount);
    }

    /// @notice withdraw  to children node initial balance
    function withdrawInitialBalance(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        /// @dev if parent is not router, call node withdraw initial balance
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).withdrawInitialBalance(_amount);
        }

        _decreaseNodeInitialBalance(_nodeAddress, _amount);

        emit ManagerWithdrew(_nodeAddress, _amount);
    }

    /// @dev only decrease node initial balance when node is unlocked period
    function _decreaseNodeInitialBalance(
        address _nodeAddess,
        uint256 _amount
    ) internal override onlyUnlockedPeriod(SubPoolNode(_nodeAddess).lockPeriod()) {
        super._decreaseNodeInitialBalance(_nodeAddess, _amount);
    }

    /// @notice check if parent is router
    /// @param _nodeAddress the address of the node
    /// @return true if parent is router
    function _checkIsParentRouter(address _nodeAddress) internal view returns (bool) {
        return SubPoolNode(_nodeAddress).parent() == address(this);
    }
}
