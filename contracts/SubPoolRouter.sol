// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './SubPool.sol';
import './SubPoolNode.sol';
import './lib/Fraction.sol';

contract SubPoolRouter is SubPool {
    event SubPoolCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolJoined(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event ManagerDeposited(address indexed _managerAddress, uint256 _amount);
    event ManagerWithdrew(address indexed _managerAddress, uint256 _amount);

    error NotNodeManager();

    error LockPeriod();

    modifier onlyUnlockedPeriod(uint _lockperiod) {
        if (_lockperiod > block.timestamp) revert LockPeriod();
        _;
    }

    modifier onlyNodeManager(address _subPoolAddress) {
        (address _managerAddress, , , ) = SubPoolNode(_subPoolAddress).manager();
        if (_managerAddress != msg.sender) revert NotNodeManager();
        _;
    }

    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint _unlockTime
    ) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses, _unlockTime);

        address _subPoolAddress = address(_subPool);
        uint256 _id = _setupNode(_subPoolAddress, msg.sender, _amount);

        _setupNodeParent(_subPool, address(this));

        emit SubPoolCreated(_subPoolAddress, _id, _amount);
        return _subPoolAddress;
    }

    function join(
        address _parentAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint _unlockTime
    ) external returns (address) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentAddress);
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses, _unlockTime);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);

        _setupNodeParent(_subPool, _parentAddress);

        emit SubPoolJoined(_subPoolAddress, _subPoolId, _amount);
        return _subPoolAddress;
    }

    function _setupNodeParent(SubPoolNode _subPool, address _parentAddress) internal {
        _subPool.setParent(_parentAddress);
    }

    function withdraw(uint256 _amount) public override onlySubNode(msg.sender) {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public override onlySubNode(msg.sender) {
        super.cashback(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function deposit(uint256 _amount) public override onlySubNode(msg.sender) {
        super.deposit(_amount);
        emit ManagerDeposited(msg.sender, _amount);
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) external onlyNodeManager(_subPoolAddress) {
        if (!_checkIsParentRouter(_subPoolAddress)) {
            return SubPoolNode(_subPoolAddress).additionalDeposit(_amount);
        }

        _increaseSubPoolBalance(_subPoolAddress, _amount);

        emit ManagerDeposited(_subPoolAddress, _amount);
    }

    function withdrawBalance(address _subPoolAddress, uint256 _amount) external onlyNodeManager(_subPoolAddress) {
        if (!_checkIsParentRouter(_subPoolAddress)) {
            return SubPoolNode(_subPoolAddress).withdrawBalance(_amount);
        }

        _decreaseSubPoolBalance(_subPoolAddress, _amount);

        emit ManagerWithdrew(_subPoolAddress, _amount);
    }

    function withdrawInitialBalance(
        address _subPoolAddress,
        uint256 _amount
    ) external onlyNodeManager(_subPoolAddress) onlyUnlockedPeriod(SubPoolNode(_subPoolAddress).lockPeriod()) {
        if (!_checkIsParentRouter(_subPoolAddress)) {
            return SubPoolNode(_subPoolAddress).withdrawInitialBalance(_amount);
        }

        _decreaseSubPoolInitialBalance(_subPoolAddress, _amount);

        emit ManagerWithdrew(_subPoolAddress, _amount);
    }

    function _checkIsParentRouter(address _subPoolAddress) internal view returns (bool) {
        return SubPoolNode(_subPoolAddress).parent() == address(this);
    }
}
