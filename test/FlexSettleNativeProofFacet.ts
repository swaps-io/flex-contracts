import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, keccak256, parseEventLogs, toEventSelector, zeroAddress } from 'viem';

import {
  flexCalcReceiveNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeReceiveNativeData,
  flexCalcConfirmNativeProofHash,
  flexEncodeConfirmNativeProofData,
  flexCalcBranch,
  flexCalcAccumulatorBranch,
  FLEX_RECEIVE_STATE_RECEIVED,
  FLEX_RECEIVE_STATE_CONFIRMED,
  FLEX_RECEIVE_STATE_REFUNDED,
  flexEncodeRefundNativeProofData,
  flexCalcRefundNativeProofHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const IMAGINARY_PROOF_BYTES = 80; // Not verified, dummy contract call

describe('FlexSettleNativeProofFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, walletClient2] = await viem.getWalletClients();

    const proofVerifier = await viem.deployContract('ProofVerifierTest');

    const flex = await viem.deployContract('FlexStandalone', [proofVerifier.address]);

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      walletClient2,
      proofVerifier,
      flex,
      resolver,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexSettleNativeProofFacet', [zeroAddress]));
  });

  it('Should confirm native with proof', async function () {
    const { publicClient, walletClient, walletClient2, proofVerifier, flex, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const confirmReceiver = walletClient2.account.address;

    const confirmEventChain = 12345n;
    const confirmEventSignature = toEventSelector('SomeConfirmEvent(bytes32)');
    const confirmNativeProof = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_PROOF_BYTES)));

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveNativeDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveNativeDomain',
      args: [],
    });
    const receiveNativeData = flexEncodeReceiveNativeData({
      sender,
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
    });
    const receiveNativeHash = flexCalcReceiveNativeHash({
      domain: receiveNativeDomain,
      data: receiveNativeData,
    });

    const settleNativeDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSettleNativeProofDomain',
      args: [],
    });
    const confirmNativeData = flexEncodeConfirmNativeProofData({
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
      confirmReceiver,
      eventChain: confirmEventChain,
      eventSignature: confirmEventSignature,
    });
    const confirmNativeHash = flexCalcConfirmNativeProofHash({
      domain: settleNativeDomain,
      data: confirmNativeData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveNativeHash, confirmNativeHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveNativeBranch = flexCalcBranch({ tree: orderTree, leaf: receiveNativeHash });
    const confirmNativeBranch = flexCalcAccumulatorBranch({
      branch: flexCalcBranch({ tree: orderTree, leaf: confirmNativeHash }),
      hashBefore: zeroAddress,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          confirmNativeData.receiveData[0],
          confirmNativeData.receiveData[1],
          confirmNativeData.settleProofData[0],
          confirmNativeData.settleProofData[1],
          confirmNativeProof,
          confirmNativeBranch,
        ],
      }),
    ).rejectedWith(
      'InvalidTestProof()', // Proof not allowed yet
    );

    await proofVerifier.write.allowHashEventProof([
      confirmEventSignature,
      orderHash,
      confirmEventChain,
      confirmNativeProof,
    ]);

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          confirmNativeData.receiveData[0],
          confirmNativeData.receiveData[1],
          confirmNativeData.settleProofData[0],
          confirmNativeData.settleProofData[1],
          confirmNativeProof,
          confirmNativeBranch,
        ],
      }),
    ).rejectedWith(
      'FlexStateError()', // Order with receiver nonce not in `Received` state yet
    );

    await walletClient.writeContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveNative',
      args: [
        receiveNativeData.receiveData[0],
        receiveNativeBranch,
        receiverSignature,
      ],
      value: amount,
    });

    let expectedReceiveHash: Hex;
    {
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(FLEX_RECEIVE_STATE_RECEIVED);

      expectedReceiveHash = flexCalcAccumulatorHash({ hashBefore: zeroAddress, hashToAdd: orderHash });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }

    const receiverBalanceBefore = await publicClient.getBalance({ address: confirmReceiver });

    {
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          confirmNativeData.receiveData[0],
          confirmNativeData.receiveData[1],
          confirmNativeData.settleProofData[0],
          confirmNativeData.settleProofData[1],
          confirmNativeProof,
          confirmNativeBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleNativeProof gas: ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexConfirm',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);

      {
        const balance = await publicClient.getBalance({ address: flex.address });
        expect(balance).equal(0n);
      }
      {
        const balance = await publicClient.getBalance({ address: confirmReceiver });
        expect(balance - receiverBalanceBefore).equal(amount);
      }
    }

    {
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(FLEX_RECEIVE_STATE_CONFIRMED);
    }
  });

  it('Should refund native with proof', async function () {
    const { publicClient, walletClient, walletClient2, proofVerifier, flex, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const refundReceiver = walletClient2.account.address;

    const refundEventChain = 12345n;
    const refundEventSignature = toEventSelector('SomeRefundEvent(bytes32)');
    const refundNativeProof = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_PROOF_BYTES)));

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveNativeDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveNativeDomain',
      args: [],
    });
    const receiveNativeData = flexEncodeReceiveNativeData({
      sender,
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
    });
    const receiveNativeHash = flexCalcReceiveNativeHash({
      domain: receiveNativeDomain,
      data: receiveNativeData,
    });

    const settleNativeDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSettleNativeProofDomain',
      args: [],
    });
    const refundNativeData = flexEncodeRefundNativeProofData({
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
      refundReceiver,
      eventChain: refundEventChain,
      eventSignature: refundEventSignature,
    });
    const refundNativeHash = flexCalcRefundNativeProofHash({
      domain: settleNativeDomain,
      data: refundNativeData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveNativeHash, refundNativeHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveNativeBranch = flexCalcBranch({ tree: orderTree, leaf: receiveNativeHash });
    const refundNativeBranch = flexCalcAccumulatorBranch({
      branch: flexCalcBranch({ tree: orderTree, leaf: refundNativeHash }),
      hashBefore: zeroAddress,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          refundNativeData.receiveData[0],
          refundNativeData.receiveData[1],
          refundNativeData.settleProofData[0],
          refundNativeData.settleProofData[1],
          refundNativeProof,
          refundNativeBranch,
        ],
      }),
    ).rejectedWith(
      'InvalidTestProof()', // Proof not allowed yet
    );

    await proofVerifier.write.allowHashEventProof([
      refundEventSignature,
      orderHash,
      refundEventChain,
      refundNativeProof,
    ]);

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          refundNativeData.receiveData[0],
          refundNativeData.receiveData[1],
          refundNativeData.settleProofData[0],
          refundNativeData.settleProofData[1],
          refundNativeProof,
          refundNativeBranch,
        ],
      }),
    ).rejectedWith(
      'FlexStateError()', // Order with receiver nonce not in `Received` state yet
    );

    await walletClient.writeContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveNative',
      args: [
        receiveNativeData.receiveData[0],
        receiveNativeBranch,
        receiverSignature,
      ],
      value: amount,
    });

    let expectedReceiveHash: Hex;
    {
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(FLEX_RECEIVE_STATE_RECEIVED);

      expectedReceiveHash = flexCalcAccumulatorHash({ hashBefore: zeroAddress, hashToAdd: orderHash });

      const hash = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }

    const receiverBalanceBefore = await publicClient.getBalance({ address: refundReceiver });

    {
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNativeProof',
        args: [
          refundNativeData.receiveData[0],
          refundNativeData.receiveData[1],
          refundNativeData.settleProofData[0],
          refundNativeData.settleProofData[1],
          refundNativeProof,
          refundNativeBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleNativeProof gas: ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexRefund',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);

      {
        const balance = await publicClient.getBalance({ address: flex.address });
        expect(balance).equal(0n);
      }
      {
        const balance = await publicClient.getBalance({ address: refundReceiver });
        expect(balance - receiverBalanceBefore).equal(amount);
      }
    }

    {
      const state = await publicClient.readContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(FLEX_RECEIVE_STATE_REFUNDED);
    }
  });
});
