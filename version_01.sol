// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SubPool is Ownable {
    address public manager;
    uint256 public nextSubPoolID = 0;
    mapping(uint256 => address) public subPools;

    constructor(address _manager) {
        manager = _manager;
    }

    function join(address _subPoolAddress, uint256 subPoolId) external onlyOwner {
        subPools[subPoolId] = _subPoolAddress;
        nextSubPoolID++;
    }
}

contract RouterSubPool {
    event Created(address indexed subPool);
    event Joined(address indexed parentSubPool, address indexed subPool, uint256 indexed subPoolId);

    function create() external returns (address) {
        SubPool subPool = new SubPool(msg.sender);

        emit Created(address(subPool));
        return address(subPool);
    }

    function join(address _parentSubPoolAddress, address _subPoolAddress) external returns (bool) {
        SubPool _parentSubPool = SubPool(_parentSubPoolAddress);
        uint256 _currentID = _parentSubPool.nextSubPoolID();

        _parentSubPool.join(_subPoolAddress, _currentID);

        emit Joined(_parentSubPoolAddress, _subPoolAddress, _currentID);
        return true;
    }
}
