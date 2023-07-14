// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IManager {
    function invitedOnly() external view returns (bool);

    function setInvitedOnly(bool _invitedOnly) external;

    function invite(address _invitedAddress) external;
}
