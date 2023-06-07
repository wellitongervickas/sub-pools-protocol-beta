// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SubPool.sol";

contract SubPoolFactory {
    address subPoolRouter;
    
    event Created(address indexed subPool);

    constructor(address _subPoolRouter) {
        subPoolRouter = _subPoolRouter;
    }

    function create(uint256[2] memory fee) external returns (address) {
        SubPool subPool = new SubPool(msg.sender, fee);

        _setSubPoolRouterAsOwner(subPool);

        emit Created(address(subPool));
        return address(subPool);
    }

    function _setSubPoolRouterAsOwner(SubPool subPool) internal {
        subPool.transferOwnership(subPoolRouter);
    }
}