// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;
import '@openzeppelin/contracts/utils/Counters.sol';

import {INodeControl} from '../interfaces/node/INodeControl.sol';

contract NodeControl is INodeControl {
    using Counters for Counters.Counter;

    Counters.Counter private currentID;

    mapping(address => INodeControl.Setup) private _node;

    function _setupNode(address _nodeAddress, address _managerAddress) internal {
        uint256 _id = _createID();
        _node[_nodeAddress] = INodeControl.Setup({id: _id, managerAddress: _managerAddress});
    }

    function _createID() private returns (uint256) {
        currentID.increment();
        return currentID.current();
    }

    function nodes(address _nodeAddress) public view override returns (INodeControl.Setup memory) {
        return _node[_nodeAddress];
    }
}
