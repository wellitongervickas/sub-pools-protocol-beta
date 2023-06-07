// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SubPool.sol";

contract SubPoolFactory {
    address subPoolRouter;

    constructor(address _subPoolRouter) {
        subPoolRouter = _subPoolRouter;
    }

    function createSubPool() external returns (address) {
        SubPool subPool = new SubPool();

        _setSubPoolRouterAsOwner(subPool);

        return address(subPool);
    }

    function _setSubPoolRouterAsOwner(SubPool subPool) internal {
        subPool.transferOwnership(subPoolRouter);
    }
}