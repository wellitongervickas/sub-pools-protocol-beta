// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SubPool.sol";

contract SubPoolFactory {
    address subPoolRouter;

    constructor(address _subPoolRouter) {
        subPoolRouter = _subPoolRouter;
    }

    function createMainSubPool() external returns (address) {
        SubPool subPool = new SubPool();

        _setSubPoolRouterAsParent(subPool);
        // _setSubPoolRouterAsOwner(subPool);

        return address(subPool);
    }

    function createSubPool() external returns (address) {
        SubPool subPool = new SubPool();

        // _setSubPoolRouterAsOwner(subPool);

        return address(subPool);
    }

    function _setSubPoolRouterAsParent(SubPool subPool) internal {
        subPool.setParentSubPool(subPoolRouter);
    }

    // function _setSubPoolRouterAsOwner(SubPool subPool) internal {
    //     subPool.transferOwnership(subPoolRouter);
    // }
}