// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IAccountController {
    struct Account {
        uint256 id; /// @dev the account id
        address accountOwnerAddress; /// @dev the address of the account owner
    }

    /**
     * @notice get the account of the address
     * @param _accountAddress the address of the account
     * @return the account
     */
    function accounts(address _accountAddress) external view returns (Account memory);
}
