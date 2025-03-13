import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, keccak256, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcReceiveNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeReceiveNativeData,
  flexCalcConfirmNativeHash,
  flexEncodeConfirmNativeData,
  flexCalcBranch,
  flexCalcAccumulatorBranch,
  FLEX_RECEIVE_STATE_RECEIVED,
  FLEX_RECEIVE_STATE_CONFIRMED,
  FLEX_RECEIVE_STATE_REFUNDED,
  flexEncodeRefundNativeData,
  flexCalcRefundNativeHash,
  flexCalcReceiveAccumulatorHash,
  FLEX_UNALLOCATED_HASH,
} from '@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call

describe('FlexSettleNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, walletClient2] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      walletClient2,
      flex,
      resolver,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexSettleNativeFacet'));
  });

  it('Should confirm native', async function () {
    const { publicClient, walletClient, walletClient2, flex, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const confirmReceiver = walletClient2.account.address;

    const confirmKey = '0x5ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8' as const;
    const confirmKeyHash = keccak256(confirmKey);

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
      functionName: 'flexSettleNativeDomain',
      args: [],
    });
    const confirmNativeData = flexEncodeConfirmNativeData({
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
      keyHash: confirmKeyHash,
      confirmReceiver,
    });
    const confirmNativeHash = flexCalcConfirmNativeHash({
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
      hashBefore: FLEX_UNALLOCATED_HASH,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNative',
        args: [
          confirmNativeData.receiveData[0],
          confirmNativeData.receiveData[1],
          confirmNativeData.settleData[0],
          confirmNativeData.settleData[1],
          confirmKey,
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

      expectedReceiveHash = flexCalcReceiveAccumulatorHash({ hashBefore: FLEX_UNALLOCATED_HASH, orderHash });

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
        functionName: 'flexSettleNative',
        args: [
          confirmNativeData.receiveData[0],
          confirmNativeData.receiveData[1],
          confirmNativeData.settleData[0],
          confirmNativeData.settleData[1],
          confirmKey,
          confirmNativeBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleNative gas: ${receipt.gasUsed}`);

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

  it('Should refund native', async function () {
    const { publicClient, walletClient, walletClient2, flex, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const refundReceiver = walletClient2.account.address;

    const refundKey = '0x71ec3f734905b920b001e7add7b0e5016c4de1c635489d44751a9960a275459e' as const;
    const refundKeyHash = keccak256(refundKey);

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
      functionName: 'flexSettleNativeDomain',
      args: [],
    });
    const refundNativeData = flexEncodeRefundNativeData({
      receiver,
      receiverContract,
      amount,
      deadline,
      nonce,
      keyHash: refundKeyHash,
      refundReceiver,
    });
    const refundNativeHash = flexCalcRefundNativeHash({
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
      hashBefore: FLEX_UNALLOCATED_HASH,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleNative',
        args: [
          refundNativeData.receiveData[0],
          refundNativeData.receiveData[1],
          refundNativeData.settleData[0],
          refundNativeData.settleData[1],
          refundKey,
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

      expectedReceiveHash = flexCalcReceiveAccumulatorHash({ hashBefore: FLEX_UNALLOCATED_HASH, orderHash });

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
        functionName: 'flexSettleNative',
        args: [
          refundNativeData.receiveData[0],
          refundNativeData.receiveData[1],
          refundNativeData.settleData[0],
          refundNativeData.settleData[1],
          refundKey,
          refundNativeBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleNative gas: ${receipt.gasUsed}`);

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
