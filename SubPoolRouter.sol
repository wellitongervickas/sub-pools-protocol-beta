// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SubPool.sol";

contract SubPoolRouter {
    struct SubPoolInfo {
        uint256 balance;
    }
    
    mapping(address => SubPoolInfo) public subPools;
    
    event Joined(address indexed parentSubPool, address indexed subPool, uint256 indexed subPoolId);

    function depositAndJoin(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) external returns (uint256) {
        SubPool _subPool = SubPool(_subPoolAddress);
        SubPool _parentSubPool = SubPool(_parentSubPoolAddress);
        
        uint256 managerAmount = _subPool.calculateManagerFee(_amount);
        uint256 subPoolAmount = _amount - managerAmount;

        _subPool.setManagerBalance(managerAmount);
        _subPool.setSubPoolBalance(_subPoolAddress, subPoolAmount);

        uint256 subPoolId = join(_parentSubPool, _subPool);

        _parentSubPool.setSubPoolBalance(_subPoolAddress, _amount);

        return subPoolId;
    }

    function join(SubPool _parentSubPool, SubPool _subPool) internal returns (uint256) {
        uint256 _currentID = _parentSubPool.join(address(_subPool));
        _subPool.setParentSubPool(address(_parentSubPool));

        emit Joined(address(_parentSubPool), address(_subPool), _currentID);
        return _currentID;
    }
}
