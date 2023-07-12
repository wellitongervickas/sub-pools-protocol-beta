// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {NodeLib} from '../libraries/Node.sol';

contract NodeControl {
    using NodeLib for NodeLib.Node;

    mapping(address => NodeLib.Node) private _node;

    function join(address _nodeAddress, address _managerAddress) external {
        _setupNode(_nodeAddress, _managerAddress);
    }

    function _setupNode(address _nodeAddress, address _managerAddress) internal {
        _node[_nodeAddress] = NodeLib.Node({managerAddress: _managerAddress});
    }

    function node(address _nodeAddress) public view returns (NodeLib.Node memory) {
        return _node[_nodeAddress];
    }
}
