// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Children} from '../children/Children.sol';
import {ChildrenControl} from '../children/ChildrenControl.sol';

contract Router is ChildrenControl {
    event NodeCreated(address indexed node);

    function create() external returns (address) {
        address _childrenAddress = _deployChildren(address(this), msg.sender);
        _setupChildren(_childrenAddress, msg.sender);

        emit NodeCreated(_childrenAddress);
        return _childrenAddress;
    }

    function join(address _parentAddress) external returns (address) {
        Children _parent = Children(_parentAddress);

        address _childrenAddress = _deployChildren(_parentAddress, msg.sender);
        _parent.join(_childrenAddress, msg.sender);

        emit NodeCreated(_childrenAddress);
        return _childrenAddress;
    }

    function _deployChildren(address _parentAddress, address _managerAddress) private returns (address) {
        Children _children = new Children(_parentAddress, _managerAddress);
        return address(_children);
    }
}
