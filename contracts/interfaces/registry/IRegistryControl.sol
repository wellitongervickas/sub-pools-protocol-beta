// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {RegistryLib} from '../../libraries/Registry.sol';

interface IRegistryControl {
    function accounts(address _accountAddress) external view returns (RegistryLib.Account memory);
}
