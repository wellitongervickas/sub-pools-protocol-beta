// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {INodeControl} from '../interfaces/node/INodeControl.sol';

contract NodeControl is INodeControl {
    mapping(address => INodeControl.Setup) private _node;

    constructor() {}

    function _setupNode(address _nodeAddress, address _ownerAddress) internal {
        _node[_nodeAddress] = INodeControl.Setup(_ownerAddress);
    }

    function node(address _nodeAddress) public view returns (INodeControl.Setup memory) {
        return _node[_nodeAddress];
    }
}
