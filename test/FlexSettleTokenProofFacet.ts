import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, toEventSelector, zeroAddress } from 'viem';

import {
  flexCalcReceiveTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeReceiveTokenData,
  flexCalcConfirmTokenProofHash,
  flexEncodeConfirmTokenProofData,
  flexCalcBranch,
  flexCalcAccumulatorBranch,
  FLEX_RECEIVE_STATE_RECEIVED,
  FLEX_RECEIVE_STATE_CONFIRMED,
  FLEX_RECEIVE_STATE_REFUNDED,
  flexEncodeRefundTokenProofData,
  flexCalcRefundTokenProofHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const IMAGINARY_PROOF_BYTES = 80; // Not verified, dummy contract call

describe('FlexSettleTokenProofFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, walletClient2] = await viem.getWalletClients();

    const proofVerifier = await viem.deployContract('ProofVerifierTest');

    const flex = await viem.deployContract('FlexStandalone', [proofVerifier.address]);

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      walletClient2,
      proofVerifier,
      flex,
      resolver,
      token,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexSettleTokenProofFacet', [zeroAddress]));
  });

  it('Should confirm token with proof', async function () {
    const { publicClient, walletClient, walletClient2, proofVerifier, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const confirmReceiver = walletClient2.account.address;

    const confirmEventChain = 12345n;
    const confirmEventSignature = toEventSelector('SomeConfirmEvent(bytes32)');
    const confirmTokenProof = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_PROOF_BYTES)));

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
      functionName: 'flexSettleTokenProofDomain',
      args: [],
    });
    const confirmTokenData = flexEncodeConfirmTokenProofData({
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
      confirmReceiver,
      eventChain: confirmEventChain,
      eventSignature: confirmEventSignature,
    });
    const confirmTokenHash = flexCalcConfirmTokenProofHash({
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
        functionName: 'flexSettleTokenProof',
        args: [
          confirmTokenData.receiveData[0],
          confirmTokenData.receiveData[1],
          confirmTokenData.receiveData[2],
          confirmTokenData.settleProofData[0],
          confirmTokenData.settleProofData[1],
          confirmTokenProof,
          confirmTokenBranch,
        ],
      }),
    ).rejectedWith(
      'InvalidTestProof()', // Proof not allowed yet
    );

    await proofVerifier.write.allowHashEventProof([
      confirmEventSignature,
      orderHash,
      confirmEventChain,
      confirmTokenProof,
    ]);

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleTokenProof',
        args: [
          confirmTokenData.receiveData[0],
          confirmTokenData.receiveData[1],
          confirmTokenData.receiveData[2],
          confirmTokenData.settleProofData[0],
          confirmTokenData.settleProofData[1],
          confirmTokenProof,
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
        functionName: 'flexSettleTokenProof',
        args: [
          confirmTokenData.receiveData[0],
          confirmTokenData.receiveData[1],
          confirmTokenData.receiveData[2],
          confirmTokenData.settleProofData[0],
          confirmTokenData.settleProofData[1],
          confirmTokenProof,
          confirmTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleTokenProof gas: ${receipt.gasUsed}`);

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

  it('Should refund token with proof', async function () {
    const { publicClient, walletClient, walletClient2, proofVerifier, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;
    const refundReceiver = walletClient2.account.address;

    const refundEventChain = 12345n;
    const refundEventSignature = toEventSelector('SomeRefundEvent(bytes32)');
    const refundTokenProof = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_PROOF_BYTES)));

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
      functionName: 'flexSettleTokenProofDomain',
      args: [],
    });
    const refundTokenData = flexEncodeRefundTokenProofData({
      receiver,
      receiverContract,
      token: token.address,
      amount,
      deadline,
      nonce,
      refundReceiver,
      eventChain: refundEventChain,
      eventSignature: refundEventSignature,
    });
    const refundTokenHash = flexCalcRefundTokenProofHash({
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
        functionName: 'flexSettleTokenProof',
        args: [
          refundTokenData.receiveData[0],
          refundTokenData.receiveData[1],
          refundTokenData.receiveData[2],
          refundTokenData.settleProofData[0],
          refundTokenData.settleProofData[1],
          refundTokenProof,
          refundTokenBranch,
        ],
      }),
    ).rejectedWith(
      'InvalidTestProof()', // Proof not allowed yet
    );

    await proofVerifier.write.allowHashEventProof([
      refundEventSignature,
      orderHash,
      refundEventChain,
      refundTokenProof,
    ]);

    await expect(
      walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexSettleTokenProof',
        args: [
          refundTokenData.receiveData[0],
          refundTokenData.receiveData[1],
          refundTokenData.receiveData[2],
          refundTokenData.settleProofData[0],
          refundTokenData.settleProofData[1],
          refundTokenProof,
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
        functionName: 'flexSettleTokenProof',
        args: [
          refundTokenData.receiveData[0],
          refundTokenData.receiveData[1],
          refundTokenData.receiveData[2],
          refundTokenData.settleProofData[0],
          refundTokenData.settleProofData[1],
          refundTokenProof,
          refundTokenBranch,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSettleTokenProof gas: ${receipt.gasUsed}`);

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
