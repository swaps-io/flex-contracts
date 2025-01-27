// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../facets/FlexReceiveNativeFacet.sol";
import {FlexReceiveNativeDomainFacet} from "../facets/FlexReceiveNativeDomainFacet.sol";
import {FlexReceiveStateFacet} from "../facets/FlexReceiveStateFacet.sol";
import {FlexReceiveHashFacet} from "../facets/FlexReceiveHashFacet.sol";

contract FlexReceiveStandalone is FlexReceiveNativeFacet, FlexReceiveNativeDomainFacet, FlexReceiveStateFacet, FlexReceiveHashFacet {
    constructor(bytes32 domain_)
        FlexReceiveNativeFacet(domain_)
        FlexReceiveNativeDomainFacet(domain_)
    {}
}
