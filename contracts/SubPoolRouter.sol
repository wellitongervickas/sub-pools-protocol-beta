// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './SubPoolNode.sol';
import './lib/SubPoolLib.sol';
import './interfaces/SubPool.sol';

contract SubPoolRouter is SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    event SubPoolMainCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolNodeCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);

    function createMain(uint256 _amount, address[] memory _invitedAddresses) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _id = _updateCurrentSubPoolID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({id: _id, initialBalance: _amount, balance: 0});
        _setSubPoolParent(_subPool, address(this));

        emit SubPoolMainCreated(_subPoolAddress, subPools[_subPoolAddress].id, _amount);

        return _subPoolAddress;
    }

    function _setSubPoolParent(SubPoolNode _subPool, address _parentSubPoolAddress) internal {
        _subPool.setParentSubPool(_parentSubPoolAddress);
    }

    function createNode(
        address _parentSubPoolAddress,
        uint256 _amount,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _joinParentSubPoolAsNode(_parentSubPool, _subPoolAddress, _amount);

        _setSubPoolParent(_subPool, _parentSubPoolAddress);

        emit SubPoolNodeCreated(_subPoolAddress, _subPoolId, _amount);

        return _subPoolAddress;
    }

    function _joinParentSubPoolAsNode(
        SubPoolNode _parentSubPool,
        address _subPoolAddress,
        uint256 _amount
    ) internal returns (uint256) {
        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);
        return _subPoolId;
    }

    function deposit(address _subPoolAddress, uint256 _amount) external {
        super.deposit(msg.sender, _subPoolAddress, _amount);

        emit SubPoolDeposited(_subPoolAddress, _amount);
    }
}
