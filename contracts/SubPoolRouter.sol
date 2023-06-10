// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './SubPoolNode.sol';
import './lib/SubPoolLib.sol';

contract SubPoolRouter {
    using SubPoolLib for SubPoolLib.SubPool;

    uint256 public nextMainPoolID = 1;
    mapping(address => SubPoolLib.SubPool) public subPools;

    error NotSubPool();

    /**
     * @dev Create a new main subpool
     * @param _amount The amount of the initial deposit
     * @return The address of the new main subpool
     */

    function createMain(uint256 _amount) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender);
        address _subPoolAddress = address(_subPool);

        subPools[_subPoolAddress] = SubPoolLib.SubPool({id: nextMainPoolID, initialBalance: 0, balance: 0});

        _subPool.setParentSubPool(address(this));
        _initialDeposit(_subPoolAddress, _amount);

        nextMainPoolID++;

        return _subPoolAddress;
    }

    /**
     * @dev Create a new subpool node
     * @param _parentSubPoolAddress The address of the parent subpool
     * @param _amount The amount of the initial deposit
     * @return The address of the new subpool node
     * @return The ID of the new subpool node
     */
    function createNode(address _parentSubPoolAddress, uint256 _amount) external returns (address, uint256) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _join(_parentSubPoolAddress, _subPoolAddress, _amount);

        return (_subPoolAddress, _subPoolId);
    }

    /**
     * @dev Join a subpool node
     * @param _parentSubPoolAddress The address of the parent subpool
     * @param _subPoolAddress The address of the subpool node
     * @param _amount The amount of the initial deposit
     * @return The ID of the new subpool node
     */
    function _join(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) internal returns (uint256) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        SubPoolNode _subPool = SubPoolNode(_subPoolAddress);

        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);

        _subPool.setParentSubPool(_parentSubPoolAddress);

        return _subPoolId;
    }

    /**
     * @dev Initial deposit of a main sub pool
     * @param _subPoolAddress The address of the main sub pool
     * @param _amount The amount of the initial deposit
     */
    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal {
        subPools[_subPoolAddress]._initialDeposit(_amount);
    }

    /**
     * @dev Additional deposit of subpool node
     * @param _subPoolAddress The address of the sub pool
     * @param _amount The amount of the additional deposit
     */
    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        bool isNode = subPools[_subPoolAddress]._checkIsNode(msg.sender, _subPoolAddress);
        if (!isNode) revert NotSubPool();

        subPools[_subPoolAddress]._additionalDeposit(_amount);
    }
}
