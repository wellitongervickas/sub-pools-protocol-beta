// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ChildrenLib} from '../libraries/Children.sol';
import 'hardhat/console.sol';

contract ChildrenControl {
    using ChildrenLib for ChildrenLib.Children;

    mapping(address => ChildrenLib.Children) private _children;

    function _setupChildren(address _childrenAddress, address _managerAddress) internal {
        _children[_childrenAddress] = ChildrenLib.Children({managerAddress: _managerAddress});
    }

    function children(address _childrenAddress) public view returns (ChildrenLib.Children memory) {
        return _children[_childrenAddress];
    }

    function join(address _childrenAddress, address _managerAddress) external {
        _setupChildren(_childrenAddress, _managerAddress);
    }
}
