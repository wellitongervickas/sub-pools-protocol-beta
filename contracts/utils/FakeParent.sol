// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;
import '../SubPoolNode.sol';

contract FakeParent {
    function deposit(address _subPoolAddress, uint256 _amount) external {}

    function join(address _parentSubPoolAddress, address _subPoolAddress) external {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        _parentSubPool.join(_subPoolAddress, 0);
    }
}
