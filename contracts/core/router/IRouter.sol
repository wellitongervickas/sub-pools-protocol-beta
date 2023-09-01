// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Adapter} from '../lib/Adapter.sol';

interface IRouter {
    event Router_AdapterCreated(bytes32 id_);

    function adapters(bytes32 id_) external view returns (Adapter.Setup memory adapter_);
}
