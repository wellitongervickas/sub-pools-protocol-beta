// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SubPool is Ownable {
    address public manager;
    mapping(address => SubPool) public subPools;

    constructor(address _manager) {
        manager = _manager;
    }

    function join(address _subPoolAddress) external onlyOwner {
        SubPool subPool = SubPool(_subPoolAddress);
        subPools[_subPoolAddress] = subPool;
    }
}

contract RouterSubPool {
    event Created(address indexed subPool);
    event Joined(address indexed parentSubPool, address indexed subPool);

    function create() external returns (address) {
        SubPool subPool = new SubPool(msg.sender);

        emit Created(address(subPool));

        return address(subPool);
    }

    function join(address _parentSubPool, address _subPoolAddress) external returns (bool) {
        SubPool parentSubPool = SubPool(_parentSubPool);
        parentSubPool.join(_subPoolAddress);

        emit Joined(_parentSubPool, _subPoolAddress);

        return true;
    }
}
