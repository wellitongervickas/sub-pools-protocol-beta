// SPDX-License-Identifier: MIT
pragma solidity =0.8.21;

import {Registry} from './Registry.sol';

contract Router {
    Registry public immutable registry;

    constructor(Registry registry_) {
        registry = registry_;
    }
}
