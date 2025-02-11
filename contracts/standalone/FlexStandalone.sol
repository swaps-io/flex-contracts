// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexProofVerifierFacet} from "../facets/views/FlexProofVerifierFacet.sol";
import {FlexReceiveHashFacet} from "../facets/views/FlexReceiveHashFacet.sol";
import {FlexReceiveStateFacet} from "../facets/views/FlexReceiveStateFacet.sol";
import {FlexSendHashFacet} from "../facets/views/FlexSendHashFacet.sol";
import {FlexSendTimeFacet} from "../facets/views/FlexSendTimeFacet.sol";

import {FlexConfirmNativeProofShard} from "./shards/FlexConfirmNativeProofShard.sol";
import {FlexConfirmNativeShard} from "./shards/FlexConfirmNativeShard.sol";
import {FlexConfirmTokenProofShard} from "./shards/FlexConfirmTokenProofShard.sol";
import {FlexConfirmTokenShard} from "./shards/FlexConfirmTokenShard.sol";
import {FlexReceiveNativeShard} from "./shards/FlexReceiveNativeShard.sol";
import {FlexReceiveTokenShard} from "./shards/FlexReceiveTokenShard.sol";
import {FlexRefundNativeProofShard} from "./shards/FlexRefundNativeProofShard.sol";
import {FlexRefundNativeShard} from "./shards/FlexRefundNativeShard.sol";
import {FlexRefundTokenProofShard} from "./shards/FlexRefundTokenProofShard.sol";
import {FlexRefundTokenShard} from "./shards/FlexRefundTokenShard.sol";
import {FlexSendNativeShard} from "./shards/FlexSendNativeShard.sol";
import {FlexSendTokenShard} from "./shards/FlexSendTokenShard.sol";

import {FlexConfirmNativeDomainShard} from "./shards/views/domains/FlexConfirmNativeDomainShard.sol";
import {FlexConfirmNativeProofDomainShard} from "./shards/views/domains/FlexConfirmNativeProofDomainShard.sol";
import {FlexConfirmTokenDomainShard} from "./shards/views/domains/FlexConfirmTokenDomainShard.sol";
import {FlexConfirmTokenProofDomainShard} from "./shards/views/domains/FlexConfirmTokenProofDomainShard.sol";
import {FlexReceiveNativeDomainShard} from "./shards/views/domains/FlexReceiveNativeDomainShard.sol";
import {FlexReceiveTokenDomainShard} from "./shards/views/domains/FlexReceiveTokenDomainShard.sol";
import {FlexRefundNativeDomainShard} from "./shards/views/domains/FlexRefundNativeDomainShard.sol";
import {FlexRefundNativeProofDomainShard} from "./shards/views/domains/FlexRefundNativeProofDomainShard.sol";
import {FlexRefundTokenDomainShard} from "./shards/views/domains/FlexRefundTokenDomainShard.sol";
import {FlexRefundTokenProofDomainShard} from "./shards/views/domains/FlexRefundTokenProofDomainShard.sol";
import {FlexSendNativeDomainShard} from "./shards/views/domains/FlexSendNativeDomainShard.sol";
import {FlexSendTokenDomainShard} from "./shards/views/domains/FlexSendTokenDomainShard.sol";

contract FlexStandalone is
    // FlexConfirmNativeProofShard,
    FlexConfirmNativeShard,
    // FlexConfirmTokenProofShard,
    FlexConfirmTokenShard,
    FlexReceiveNativeShard,
    FlexReceiveTokenShard,
    // FlexRefundNativeProofShard,
    FlexRefundNativeShard,
    // FlexRefundTokenProofShard,
    FlexRefundTokenShard,
    FlexSendNativeShard,
    FlexSendTokenShard,
    FlexConfirmNativeDomainShard,
    FlexConfirmNativeProofDomainShard,
    FlexConfirmTokenDomainShard,
    FlexConfirmTokenProofDomainShard,
    FlexReceiveNativeDomainShard,
    FlexReceiveTokenDomainShard,
    FlexRefundNativeDomainShard,
    FlexRefundNativeProofDomainShard,
    FlexRefundTokenDomainShard,
    FlexRefundTokenProofDomainShard,
    FlexSendNativeDomainShard,
    FlexSendTokenDomainShard,
    FlexProofVerifierFacet,
    FlexReceiveHashFacet,
    FlexReceiveStateFacet,
    FlexSendHashFacet,
    FlexSendTimeFacet
{
    constructor(address proofVerifier_)
        // FlexConfirmNativeProofShard(proofVerifier_)
        // FlexConfirmTokenProofShard(proofVerifier_)
        // FlexRefundNativeProofShard(proofVerifier_)
        // FlexRefundTokenProofShard(proofVerifier_)
        FlexProofVerifierFacet(proofVerifier_)
    {}
}
