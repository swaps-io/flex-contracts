// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

struct FlexSendProofData {
    bytes32 sendData0; // Must include domain
    bytes32 sendData1;
    bytes32 sendData2;
    bytes32 sendData3; // Zero for native
    bytes32[] orderBranch;
    uint48 bucketTime;
    bytes32 saveBucket;
}
