// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './SubPool.sol';
import './SubPoolNode.sol';
import './lib/SubPoolLib.sol';
import './lib/Fraction.sol';

import 'hardhat/console.sol';

contract SubPoolRouter is SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    event SubPoolCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolJoined(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event ManagerDeposited(address indexed _managerAddress, uint256 _amount);
    event ManagerWithdrew(address indexed _managerAddress, uint256 _amount);

    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _id = _updateCurrentID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: msg.sender,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        _setParent(_subPool, address(this));

        emit SubPoolCreated(_subPoolAddress, subPools[_subPoolAddress].id, _amount);
        return _subPoolAddress;
    }

    function _setParent(SubPoolNode _subPool, address _parentAddress) internal {
        _subPool.setParent(_parentAddress);
    }

    function join(
        address _parentAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentAddress);
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);

        _setParent(_subPool, _parentAddress);

        emit SubPoolJoined(_subPoolAddress, _subPoolId, _amount);
        return _subPoolAddress;
    }

    function withdraw(uint256 _amount) public override {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function deposit(uint256 _amount) public override {
        super.deposit(_amount);
        emit ManagerDeposited(msg.sender, _amount);
    }

    /**ToDo:check is subpool manager msg.sender */
    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        if (SubPoolNode(_subPoolAddress).parent() == address(this)) {
            _increaseSubPoolBalance(_subPoolAddress, _amount);
        } else {
            SubPoolNode(_subPoolAddress).additionalDeposit(_amount);
        }

        emit ManagerDeposited(_subPoolAddress, _amount);
    }

    /**ToDo:check is subpool manager msg.sender */
    function withdrawFunds(address _subPoolAddress, uint256 _amount) external {
        if (SubPoolNode(_subPoolAddress).parent() == address(this)) {
            _decreaseSubPoolBalance(_subPoolAddress, _amount);
        } else {
            SubPoolNode(_subPoolAddress).withdrawFunds(_amount);
        }

        emit ManagerWithdrew(_subPoolAddress, _amount);
    }
}
