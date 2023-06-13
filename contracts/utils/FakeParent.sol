// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;
import '../SubPoolNode.sol';

contract FakeParent {
    function deposit(address _subPoolAddress, uint256 _amount) external {}

    function createNode(address _parentSubPoolAddress, uint256 _amount, address[] memory _subPoolAddress) external {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        _parentSubPool.join(_subPoolAddress[0], _amount);
    }
}
