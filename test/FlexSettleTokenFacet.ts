import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, keccak256, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcReceiveTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeReceiveTokenData,
  flexCalcConfirmTokenHash,
  flexEncodeConfirmTokenData,
  flexCalcBranch,
  flexCalcAccumulatorBranch,
  FLEX_RECEIVE_STATE_RECEIVED,
  FLEX_RECEIVE_STATE_CONFIRMED,
  FLEX_RECEIVE_STATE_REFUNDED,
  flexEncodeRefundTokenData,
  flexCalcRefundTokenHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call

describe('FlexSettleTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, walletClient2] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      walletClient2,
      flex,
      resolver,
      token,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexSettleTokenFacet'));
  });

  it('Should confirm token', async function () {
    const { publicClient, walletClient, walletClient2, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const confirmReceiver = walletClient2.account.address;

    const confirmKey = '0x5ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8' as const;
    const confirmKeyHash = keccak256(confirmKey);

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;
    const existingReceiverAmount = 1_337n;

    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        sender,
        amount + amount + remainingSenderAmount,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'approve',
      args: [
        flex.address,
        amount + amount + remainingSenderAllowance,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        flex.address,
        existingFlexAmount,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        confirmReceiver,
        existingReceiverAmount,
      ],
    });

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveTokenDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenDomain',
      args: [],
    });
    const receiveTokenData = flexEncodeReceiveTokenData({
      sender,
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
    });
    const receiveTokenHash = flexCalcReceiveTokenHash({
      domain: receiveTokenDomain,
      data: receiveTokenData,
    });

    const settleTokenDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSettleTokenDomain',
      args: [],
    });
    const confirmTokenData = flexEncodeConfirmTokenData({
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
      keyHash: confirmKeyHash,
      confirmReceiver,
    });
    const confirmTokenHash = flexCalcConfirmTokenHash({
      domain: settleTokenDomain,
      data: confirmTokenData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveTokenHash, confirmTokenHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveTokenBranch = flexCalcBranch({ tree: orderTree, leaf: receiveTokenHash });
    const confirmTokenBranch = flexCalcAccumulatorBranch({
      branch: flexCalcBranch({ tree: orderTree, leaf: confirmTokenHash }),
      hashBefore: zeroAddress,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleToken',
        args: [
          confirmTokenData.receiveData[0],
          confirmTokenData.receiveData[1],
          confirmTokenData.receiveData[2],
          confirmTokenData.settleData[0],
          confirmTokenData.settleData[1],
          confirmKey,
          confirmTokenBranch,
        ],
      }),
    ).rejectedWith(
      'FlexStateError()', // Order with receiver nonce not in `Received` state yet
    );

    await walletClient.writeContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveToken',
      args: [
        receiveTokenData.receiveData[0],
        receiveTokenData.receiveData[1],
        receiveTokenData.receiveData[2],
        receiveTokenBranch,
        receiverSignature,
      ],
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

    const receiverBalanceBefore = await publicClient.readContract({
      abi: token.abi,
      address: token.address,
      functionName: 'balanceOf',
      args: [
        confirmReceiver,
      ],
    });

    {
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleToken',
        args: [
          confirmTokenData.receiveData[0],
          confirmTokenData.receiveData[1],
          confirmTokenData.receiveData[2],
          confirmTokenData.settleData[0],
          confirmTokenData.settleData[1],
          confirmKey,
          confirmTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleToken gas: ${receipt.gasUsed}`);

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
        const balance = await publicClient.readContract({
          abi: token.abi,
          address: token.address,
          functionName: 'balanceOf',
          args: [
            flex.address,
          ],
        });
        expect(balance).equal(existingFlexAmount);
      }
      {
        const balance = await publicClient.readContract({
          abi: token.abi,
          address: token.address,
          functionName: 'balanceOf',
          args: [
            confirmReceiver,
          ],
        });
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

  it('Should refund token', async function () {
    const { publicClient, walletClient, walletClient2, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const refundReceiver = walletClient2.account.address;

    const refundKey = '0x71ec3f734905b920b001e7add7b0e5016c4de1c635489d44751a9960a275459e' as const;
    const refundKeyHash = keccak256(refundKey);

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;
    const existingReceiverAmount = 1_337n;

    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        sender,
        amount + amount + remainingSenderAmount,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'approve',
      args: [
        flex.address,
        amount + amount + remainingSenderAllowance,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        flex.address,
        existingFlexAmount,
      ],
    });
    await walletClient.writeContract({
      abi: token.abi,
      address: token.address,
      functionName: 'mint',
      args: [
        refundReceiver,
        existingReceiverAmount,
      ],
    });

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveTokenDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenDomain',
      args: [],
    });
    const receiveTokenData = flexEncodeReceiveTokenData({
      sender,
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
    });
    const receiveTokenHash = flexCalcReceiveTokenHash({
      domain: receiveTokenDomain,
      data: receiveTokenData,
    });

    const settleTokenDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexSettleTokenDomain',
      args: [],
    });
    const refundTokenData = flexEncodeRefundTokenData({
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
      keyHash: refundKeyHash,
      refundReceiver,
    });
    const refundTokenHash = flexCalcRefundTokenHash({
      domain: settleTokenDomain,
      data: refundTokenData,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveTokenHash, refundTokenHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveTokenBranch = flexCalcBranch({ tree: orderTree, leaf: receiveTokenHash });
    const refundTokenBranch = flexCalcAccumulatorBranch({
      branch: flexCalcBranch({ tree: orderTree, leaf: refundTokenHash }),
      hashBefore: zeroAddress,
      hashesAfter: [],
    });

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleToken',
        args: [
          refundTokenData.receiveData[0],
          refundTokenData.receiveData[1],
          refundTokenData.receiveData[2],
          refundTokenData.settleData[0],
          refundTokenData.settleData[1],
          refundKey,
          refundTokenBranch,
        ],
      }),
    ).rejectedWith(
      'FlexStateError()', // Order with receiver nonce not in `Received` state yet
    );

    await walletClient.writeContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveToken',
      args: [
        receiveTokenData.receiveData[0],
        receiveTokenData.receiveData[1],
        receiveTokenData.receiveData[2],
        receiveTokenBranch,
        receiverSignature,
      ],
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

    const receiverBalanceBefore = await publicClient.readContract({
      abi: token.abi,
      address: token.address,
      functionName: 'balanceOf',
      args: [
        refundReceiver,
      ],
    });

    {
      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleToken',
        args: [
          refundTokenData.receiveData[0],
          refundTokenData.receiveData[1],
          refundTokenData.receiveData[2],
          refundTokenData.settleData[0],
          refundTokenData.settleData[1],
          refundKey,
          refundTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleToken gas: ${receipt.gasUsed}`);

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
        const balance = await publicClient.readContract({
          abi: token.abi,
          address: token.address,
          functionName: 'balanceOf',
          args: [
            flex.address,
          ],
        });
        expect(balance).equal(existingFlexAmount);
      }
      {
        const balance = await publicClient.readContract({
          abi: token.abi,
          address: token.address,
          functionName: 'balanceOf',
          args: [
            refundReceiver,
          ],
        });
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
