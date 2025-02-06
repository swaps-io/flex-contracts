// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexAllocateReceive {
    function flexAllocateReceive(
        bytes32 allocateData0 // Content: total buckets (48), start receiver nonce (48), receiver (160)
    ) external;
}
