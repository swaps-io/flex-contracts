// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {ERC20Permit, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TokenTest is ERC20Permit {
    string private constant NAME = "TokenTest";
    string private constant SYMBOL = "TT";

    constructor()
        ERC20(NAME, SYMBOL)
        ERC20Permit(NAME)
    {}

    function mint(address account_, uint256 amount_) external {
        _mint(account_, amount_);
    }
}
