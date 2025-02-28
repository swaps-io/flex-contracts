import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { viem } from 'hardhat';
import { encodeAbiParameters, Hex, parseAbiParameters, parseEventLogs, zeroAddress, zeroHash } from 'viem';
import { expect } from 'chai';

import {
  FLEX_SEND_EVENT_SIGNATURE,
  FLEX_SEND_FAIL_EVENT_SIGNATURE,
  FLEX_SEND_PROOF_BASE_HASH_SKIP,
  FLEX_SEND_PROOF_NATIVE_DATA3,
  FLEX_UNALLOCATED_HASH,
  flexAssignComponentDomain,
  flexCalcAccumulatorBranch,
  flexCalcBranch,
  flexCalcBranchHash,
  flexCalcSendAccumulatorHash,
  flexCalcSendNativeHash,
  flexCalcSendTokenHash,
  flexCalcTree,
  flexEncodeSaveSendData,
  flexEncodeSendAccumulatorData,
  flexEncodeSendBucketStateData,
  flexEncodeSendFailProof,
  flexEncodeSendNativeData,
  flexEncodeSendProof,
  flexEncodeSendSaveStateBucket,
  flexEncodeSendStateBucket,
  flexEncodeSendTokenData,
} from '../@swaps-io/flex-sdk';

describe('FlexSendProofVerifier', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const verifier = await viem.deployContract('FlexSendProofVerifier', [flex.address]);

    const testChainId = BigInt(await publicClient.getChainId());

    return {
      publicClient,
      walletClient,
      flex,
      verifier,
      testChainId,
    };
  }

  it('Should not verify proof with wrong chain', async function () {
    const { verifier } = await loadFixture(deployFixture);

    const sig = zeroHash;
    const hash = zeroHash;
    const chain = 1234567890n;
    const proof = '0x';

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofChainError()',
    );
  });

  it('Should not verify proof with unsupported event signature', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const sig = zeroHash;
    const hash = zeroHash;
    const chain = testChainId;
    const proof = '0x';

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofEventError()',
    );
  });

  it('Should encode expected token send proof data', async function () {
    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      token,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
    });

    const checkProof = encodeAbiParameters(
      parseAbiParameters('uint256 variant, bytes32 sendData0, bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] orderBranch, bytes32 failBaseHash, bytes32 saveBucket, uint48 saveTime'),
      [
        // ProofHeader
        variant,
        // FlexSendProofData
        flexAssignComponentDomain({ domain: sendDomain, data: sendData.sendData[0] }),
        sendData.sendData[1],
        sendData.sendData[2],
        sendData.sendData[3],
        branch,
        FLEX_SEND_PROOF_BASE_HASH_SKIP,
        saveBucket,
        saveTime,
      ],
    );
    expect(proof).equal(checkProof);
  });

  it('Should encode expected native send proof data', async function () {
    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendNativeData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendNativeHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
    });

    const checkProof = encodeAbiParameters(
      parseAbiParameters('uint256 variant, bytes32 sendData0, bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] orderBranch, bytes32 failBaseHash, bytes32 saveBucket, uint48 saveTime'),
      [
        // ProofHeader
        variant,
        // FlexSendProofData
        flexAssignComponentDomain({ domain: sendDomain, data: sendData.sendData[0] }),
        sendData.sendData[1],
        sendData.sendData[2],
        FLEX_SEND_PROOF_NATIVE_DATA3,
        branch,
        FLEX_SEND_PROOF_BASE_HASH_SKIP,
        saveBucket,
        saveTime,
      ],
    );
    expect(proof).equal(checkProof);
  });

  it('Should encode expected token send fail proof data', async function () {
    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      token,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = '0xafafafaf00000000000000000000000000000000000000000000000000000000';
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const checkProof = encodeAbiParameters(
      parseAbiParameters('uint256 variant, bytes32 sendData0, bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] orderBranch, bytes32 failBaseHash, bytes32 saveBucket, uint48 saveTime'),
      [
        // ProofHeader
        variant,
        // FlexSendProofData
        flexAssignComponentDomain({ domain: sendDomain, data: sendData.sendData[0] }),
        sendData.sendData[1],
        sendData.sendData[2],
        sendData.sendData[3],
        branch,
        failBaseHash,
        saveBucket,
        saveTime,
      ],
    );
    expect(proof).equal(checkProof);
  });

  it('Should encode expected native send fail proof data', async function () {
    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendNativeData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendNativeHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = '0xafafafaf00000000000000000000000000000000000000000000000000000000';
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const checkProof = encodeAbiParameters(
      parseAbiParameters('uint256 variant, bytes32 sendData0, bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] orderBranch, bytes32 failBaseHash, bytes32 saveBucket, uint48 saveTime'),
      [
        // ProofHeader
        variant,
        // FlexSendProofData
        flexAssignComponentDomain({ domain: sendDomain, data: sendData.sendData[0] }),
        sendData.sendData[1],
        sendData.sendData[2],
        FLEX_SEND_PROOF_NATIVE_DATA3,
        branch,
        failBaseHash,
        saveBucket,
        saveTime,
      ],
    );
    expect(proof).equal(checkProof);
  });

  it('Should not verify proof with wrong order hash', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
    });

    const sig = FLEX_SEND_EVENT_SIGNATURE;
    const hash = zeroHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofHashError()',
    );
  });

  it('Should not verify proof with missing send save', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
    });

    const sig = FLEX_SEND_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofSendSaveError()',
    );
  });

  it('Should not verify fail proof when hash presented as first in accumulator', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = '0xafafafaf00000000000000000000000000000000000000000000000000000000';
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        flexEncodeSendAccumulatorData({ orderHash, start }),
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofAccumulatorPresenceError()',
    );
  });

  it('Should not verify fail proof when hash presented as last in accumulator', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = '0xafafafaf00000000000000000000000000000000000000000000000000000000';
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        flexEncodeSendAccumulatorData({ orderHash, start }),
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofAccumulatorPresenceError()',
    );
  });

  it('Should not verify fail proof when hash presented as base in accumulator', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = flexEncodeSendAccumulatorData({ orderHash, start });
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofAccumulatorPresenceError()',
    );
  });

  it('Should not verify fail proof when may be presented before base', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const failBaseHash = flexEncodeSendAccumulatorData({
      orderHash: '0xafafafaf00000000000000000000000000000000000000000000000000000000',
      start, // The `start` value itself as `base` time will cause the fail - since there can be multiple orders with the same
    });      // `start`. To make sure no `start` hidden behind in chronological order, the verifier requires at least `start-1`.
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofBasePresenceError()',
    );
  });

  it('Should not verify fail proof when may be presented after save time not reaching deadline', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = start + duration; // The `deadline` value itself as a `save` time will cause the fail -
                                       // since send can still be submitted. At least `deadline+1` is required.

    const failBaseHash = flexEncodeSendAccumulatorData({
      orderHash: '0xafafafaf00000000000000000000000000000000000000000000000000000000',
      start: start - 1, // Good `base` time
    });
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofDeadlinePresenceError()',
    );
  });

  it('Should not verify fail proof with missing send save', async function () {
    const { verifier, testChainId } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const token = '0xf00baff00baff00baff00baff00baff00baff00b'
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendTokenData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
      token,
    });
    const sendHash = flexCalcSendTokenHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    const saveTime = start + duration + 1; // Good `deadline` time

    const failBaseHash = flexEncodeSendAccumulatorData({
      orderHash: '0xafafafaf00000000000000000000000000000000000000000000000000000000',
      start: start - 1, // Good `base` time
    });
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore: '0xbef0bef0bef0bef0bef0bef0bef0bef0bef0bef0',
      hashesAfter: [
        '0xafafafaf11111111111111111111111111111111111111111111111111111111',
        '0xafafafaf22222222222222222222222222222222222222222222222222222222',
        '0xafafafaf33333333333333333333333333333333333333333333333333333333',
        '0xafafafaf44444444444444444444444444444444444444444444444444444444',
        '0xafafafaf55555555555555555555555555555555555555555555555555555555',
      ],
    });

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await expect(
      verifier.read.verifyHashEventProof([sig, hash, chain, proof]),
    ).rejectedWith(
      'FlexProofSendSaveError()',
    );
  });

  it('Should verify valid send fail proof', async function () {
    const { verifier, testChainId, flex, walletClient, publicClient } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002;
    const group = 777;
    const sender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const amount = 123_456_789n;

    const sendDomain = '0xd0111a11d0111a11';
    const sendData = flexEncodeSendNativeData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendNativeHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = walletClient.account.address;
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    let saveTime: number; // Good `deadline` time

    const failBaseHash = FLEX_SEND_PROOF_BASE_HASH_SKIP;
    const hashBefore = FLEX_UNALLOCATED_HASH;
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore,
      hashesAfter: [],
    });

    {
      expect(walletClient.account.address).equal(saver);
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSaveSend',
        args: [
          flexEncodeSaveSendData({
            group,
            sender,
            slot,
          }),
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSaveSend gas (1st): ${receipt.gasUsed}`);

      const block = await publicClient.getBlock({ blockHash: receipt.blockHash });
      saveTime = Number(block.timestamp);
      expect(saveTime).greaterThan(start + duration); // Good `save` time

      const bucket = flexEncodeSendStateBucket({ sender, group });
      const bucketState = flexEncodeSendBucketStateData({ hash: hashBefore, time: saveTime });

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSendSave',
      });
      expect(logs.length).equal(1);

      const saveLog = logs[0];
      expect(saveLog.args.bucket).equal(bucket);
      expect(saveLog.args.bucketState).equal(bucketState);
      expect(saveLog.args.saveBucket).equal(saveBucket);
    }

    const proof = flexEncodeSendFailProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
      failBaseHash,
    });

    const sig = FLEX_SEND_FAIL_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await verifier.read.verifyHashEventProof([sig, hash, chain, proof]);
  });

  it('Should verify valid send proof', async function () {
    const { verifier, testChainId, flex, walletClient, publicClient } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_003_002_001;
    const group = 777;
    const sender = walletClient.account.address;
    const receiver = '0xc0debeefc0debeefc0debeefc0debeefc0debeef';
    const amount = 123_456_789n;

    const sendDomain = await flex.read.flexSendNativeDomain();
    const sendData = flexEncodeSendNativeData({
      sender,
      receiver,
      amount,
      start,
      duration,
      group,
    });
    const sendHash = flexCalcSendNativeHash({ domain: sendDomain, data: sendData });

    const orderComponentHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderComponentHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });
    const orderHash = flexCalcBranchHash({ branch: orderBranch, leaf: sendHash });

    const variant = 133713371337n;
    const saver = walletClient.account.address;
    const slot = 999;
    const saveBucket = flexEncodeSendSaveStateBucket({ saver, slot });
    let saveTime: number;

    const hashBefore = FLEX_UNALLOCATED_HASH;
    const branch = flexCalcAccumulatorBranch({
      branch: orderBranch,
      hashBefore,
      hashesAfter: [],
    });

    {
      expect(walletClient.account.address).equal(sender);
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSendNative',
        args: [
          sendData.sendData[1],
          orderBranch,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSend',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);
    }

    {
      expect(walletClient.account.address).equal(saver);
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSaveSend',
        args: [
          flexEncodeSaveSendData({
            group,
            sender,
            slot,
          }),
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSaveSend gas (1st): ${receipt.gasUsed}`);

      const block = await publicClient.getBlock({ blockHash: receipt.blockHash });
      saveTime = Number(block.timestamp);

      const bucket = flexEncodeSendStateBucket({ sender, group });
      const bucketState = flexEncodeSendBucketStateData({
        hash: flexCalcSendAccumulatorHash({
          hashBefore,
          orderHash,
          start,
        }),
        time: saveTime,
      });

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexSendSave',
      });
      expect(logs.length).equal(1);

      const saveLog = logs[0];
      expect(saveLog.args.bucket).equal(bucket);
      expect(saveLog.args.bucketState).equal(bucketState);
      expect(saveLog.args.saveBucket).equal(saveBucket);
    }

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch,
      saveBucket,
      saveTime,
    });

    const sig = FLEX_SEND_EVENT_SIGNATURE;
    const hash = orderHash;
    const chain = testChainId;

    await verifier.read.verifyHashEventProof([sig, hash, chain, proof]);
  });
});
