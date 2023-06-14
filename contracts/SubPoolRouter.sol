// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './SubPoolNode.sol';
import './lib/SubPoolLib.sol';

contract SubPoolRouter {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    Counters.Counter public nextMainPoolID; // starts from 0
    mapping(address => SubPoolLib.SubPool) public subPools;

    // events
    event SubPoolNodeDeposited(address indexed _subPoolAddress, uint256 _amount);
    event SubPoolMainCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolNodeCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);

    // errors
    error NodeNotAllowed();

    /**
     * @dev Create a new main subpool
     * @param _amount The amount of the initial deposit
     * @return The address of the new main subpool
     */

    function createMain(uint256 _amount, address[] memory _invitedAddresses) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _invitedAddresses);
        address _subPoolAddress = address(_subPool);

        nextMainPoolID.increment();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            id: nextMainPoolID.current(),
            initialBalance: _amount,
            balance: 0
        });

        _subPool.setParentSubPool(address(this));

        emit SubPoolMainCreated(_subPoolAddress, subPools[_subPoolAddress].id, _amount);

        return _subPoolAddress;
    }

    /**
     * @dev Create a new subpool node
     * @param _parentSubPoolAddress The address of the parent subpool
     * @param _amount The amount of the initial deposit
     * @return  address of the new node subpool
     */
    function createNode(
        address _parentSubPoolAddress,
        uint256 _amount,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);

        _subPool.setParentSubPool(_parentSubPoolAddress);

        emit SubPoolNodeCreated(_subPoolAddress, _subPoolId, _amount);

        return _subPoolAddress;
    }

    /**
     * @dev deposit of subpool node
     * @param _subPoolAddress The address of the sub pool
     * @param _amount The amount of the additional deposit
     */
    function deposit(address _subPoolAddress, uint256 _amount) external {
        bool isNode = subPools[_subPoolAddress]._checkIsNode(msg.sender, _subPoolAddress);
        if (!isNode) revert NodeNotAllowed();

        subPools[_subPoolAddress]._deposit(_amount);

        emit SubPoolNodeDeposited(_subPoolAddress, _amount);
    }
}
