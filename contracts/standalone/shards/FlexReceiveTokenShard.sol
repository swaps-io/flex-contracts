// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveTokenFacet} from "../../facets/FlexReceiveTokenFacet.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexReceiveTokenShard is FlexReceiveTokenFacet {
    constructor()
        FlexReceiveTokenFacet(
            FlexStandaloneDomain.calc(FlexReceiveTokenFacet.flexReceiveToken.selector)
        )
    {}
}
