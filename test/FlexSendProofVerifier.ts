import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { viem } from 'hardhat';
import { encodeAbiParameters, Hex, parseAbiParameters, zeroAddress, zeroHash } from 'viem';
import { expect } from 'chai';

import {
  flexAssignComponentDomain,
  flexCalcBranch,
  flexCalcSendTokenHash,
  flexCalcTree,
  flexEncodeSendProof,
  flexEncodeSendSaveBucket,
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

  it('Should encode expected send proof data', async function () {
    const start = 123_456;
    const duration = 4_003_002_001n;
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

    const orderHashes: Hex[] = [
      sendHash,
      '0xe93c632bf8243f5ce2d70d0d13e76a868573c74437cdc32fea4c0e3afccd6523',
      '0x9e3cefcd2210a275f810c0e956471e061830088607b4db84becbba153a283392',
      '0x5fafb9728bd8166de4388cc96e76776c11b84133f8a2db79df9f5dc8d1a15ec0',
      '0x81a7287cb6819d35be18e8141820f920e005da0c0832895bbdd7c90595259794',
      '0x70ab6d7fb5e05d8f3cfe66c2d92ad16063dbc36e90aad06df4ad2021924f6ef6',
    ];
    const orderTree = flexCalcTree({ leaves: orderHashes });
    const orderBranch = flexCalcBranch({ tree: orderTree, leaf: sendHash });

    const variant = 133713371337n;
    const saver = '0x5a7ef55a7ef55a7ef55a7ef55a7ef55a7ef55a7e';
    const slot = 999;
    const saveBucket = flexEncodeSendSaveBucket({ saver, slot });
    const saveTime = 1_750_750_750;

    const proof = flexEncodeSendProof({
      variant,
      domain: sendDomain,
      data: sendData,
      branch: orderBranch,
      saveBucket,
      saveTime,
    });

    const checkProof = encodeAbiParameters(
      parseAbiParameters('uint256 variant, bytes32 sendData0, bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] orderBranch, bytes32 failBaseState, bytes32 saveBucket, uint48 saveTime'),
      [
        // ProofHeader
        variant,
        // FlexSendProofData
        flexAssignComponentDomain({ domain: sendDomain, data: sendData.sendData[0] }),
        sendData.sendData[1],
        sendData.sendData[2],
        sendData.sendData[3],
        orderBranch,
        zeroHash,
        saveBucket,
        saveTime,
      ],
    );
    expect(proof).equal(checkProof);
  });
});
