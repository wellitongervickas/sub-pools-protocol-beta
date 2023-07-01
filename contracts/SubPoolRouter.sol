// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import './SubPool.sol';
import './SubPoolNode.sol';
import './lib/Fraction.sol';

contract SubPoolRouter is SubPool {
    /// @notice indicate when node is created
    event NodeCreated(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    /// @notice indicate when node is joined
    event NodeJoined(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    /// @notice indicate whe node manager ddposited
    event ManagerDeposited(address indexed _managerAddress, uint256 _amount);
    /// @notice indicate when node manager withdrew
    event ManagerWithdrew(address indexed _managerAddress, uint256 _amount);

    /// @notice indicate when try to call a function that only manager can
    error NotNodeManager();

    /// @dev check if the caller is the manager of the node
    modifier onlyNodeManager(address _nodeAddress) {
        (address _managerAddress, , , ) = SubPoolNode(_nodeAddress).manager();
        if (_managerAddress != msg.sender) revert NotNodeManager();
        _;
    }

    /// @notice create a new root node
    /// @param _amount the amount of the root node as initial deposit
    /// @param _fees the fees of the root node to use as spli ratio
    /// @param _invitedAddresses the addresses to invite as node to the root node
    /// @param _lockperiod the lock period of the root node
    /// @param _requiredInitialAmount the required initial amount of the root node when node join
    /// @return the address of the new root node
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

        /// @dev set the parent of the root node to itself
        _setupNodeParent(_node, address(this));

        emit NodeCreated(_nodeAddress, _id, _amount);
        return _nodeAddress;
    }

    /// @notice create node and join to parent node
    /// @param _parentNodeAddress the address of the parent node
    /// @param _amount the amount of the node as initial deposit
    /// @param _fees the fees of the node to use as split ratio
    /// @param _invitedAddresses the addresses to invite as node to the node
    /// @param _lockperiod the lock period of the node
    /// @param _requiredInitialAmount the required initial amount of the node when node join
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
        uint256 _nodeId = _parentNode.join(_nodeAddress, _amount);

        _setupNodeParent(_node, _parentNodeAddress);

        emit NodeJoined(_nodeAddress, _nodeId, _amount);
        return _nodeAddress;
    }

    function _setupNodeParent(SubPoolNode _node, address _parentNodeAddress) internal {
        _node.setParent(_parentNodeAddress);
    }

    function withdraw(uint256 _amount) public override OnlyNode(msg.sender) {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public override OnlyNode(msg.sender) {
        super.cashback(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function deposit(uint256 _amount) public override OnlyNode(msg.sender) {
        super.deposit(_amount);
        emit ManagerDeposited(msg.sender, _amount);
    }

    function additionalDeposit(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).additionalDeposit(_amount);
        }

        _increaseNodeBalance(_nodeAddress, _amount);

        emit ManagerDeposited(_nodeAddress, _amount);
    }

    function withdrawBalance(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).withdrawBalance(_amount);
        }

        _decreaseNodeBalance(_nodeAddress, _amount);

        emit ManagerWithdrew(_nodeAddress, _amount);
    }

    function withdrawInitialBalance(address _nodeAddress, uint256 _amount) external onlyNodeManager(_nodeAddress) {
        if (!_checkIsParentRouter(_nodeAddress)) {
            return SubPoolNode(_nodeAddress).withdrawInitialBalance(_amount);
        }

        _decreaseNodeInitialBalance(_nodeAddress, _amount);

        emit ManagerWithdrew(_nodeAddress, _amount);
    }

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
