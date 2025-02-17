import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcReceiveTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeReceiveTokenData,
  flexCalcBranch,
  FLEX_RECEIVE_STATE_NONE,
  FLEX_RECEIVE_STATE_RECEIVED,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65;

describe('FlexReceiveTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      flex,
      resolver,
      token,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexReceiveTokenFacet'));
  });

  it('Should receive token', async function () {
    const { publicClient, walletClient, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;

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

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

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

    const componentHashes = [receiveTokenHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveTokenBranch = flexCalcBranch({ tree: orderTree, leaf: receiveTokenHash });

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
      expect(state).equal(FLEX_RECEIVE_STATE_NONE);

      expectedReceiveHash = zeroAddress;

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

    {
      const hash = await walletClient.writeContract({
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

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveToken gas (1st): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexReceive',
        args: {
          orderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          flex.address,
        ],
      });
      expect(balance).equal(existingFlexAmount + amount);
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
      expect(state).equal(FLEX_RECEIVE_STATE_RECEIVED);

      expectedReceiveHash = flexCalcAccumulatorHash({ hashBefore: expectedReceiveHash, hashToAdd: orderHash });

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

    await expect(
      walletClient.writeContract({
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
      }),
    ).rejectedWith(
      'FlexStateError()', // Same order used (receiver nonce already in `Received` state)
    );

    {
      const newNonce = 424_243n; // +1

      {
        const state = await publicClient.readContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexReceiveState',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(state).equal(FLEX_RECEIVE_STATE_NONE);

        const hash = await publicClient.readContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexReceiveHash',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(hash).equal(expectedReceiveHash);
      }

      const newReceiveTokenData = flexEncodeReceiveTokenData({
        sender,
        receiver,
        receiverContract,
        token: token.address,
        amount,
        deadline,
        nonce: newNonce,
      });
      const newReceiveTokenHash = flexCalcReceiveTokenHash({
        domain: receiveTokenDomain,
        data: newReceiveTokenData,
      });

      const newComponentHashes = [newReceiveTokenHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newReceiveComponentBranch = flexCalcBranch({ tree: newOrderTree, leaf: newReceiveTokenHash });

      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveToken',
        args: [
          newReceiveTokenData.receiveData[0],
          newReceiveTokenData.receiveData[1],
          newReceiveTokenData.receiveData[2],
          newReceiveComponentBranch,
          receiverSignature,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveToken gas (2nd): ${receipt.gasUsed}`);

      const logs = parseEventLogs({
        abi: flex.abi,
        logs: receipt.logs,
        eventName: 'FlexReceive',
        args: {
          orderHash: newOrderHash,
        },
      });
      expect(logs.length).equal(1);

      const balance = await publicClient.readContract({
        abi: token.abi,
        address: token.address,
        functionName: 'balanceOf',
        args: [
          flex.address,
        ],
      });
      expect(balance).equal(existingFlexAmount + amount + amount);

      {
        const state = await publicClient.readContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexReceiveState',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(state).equal(FLEX_RECEIVE_STATE_RECEIVED);

        expectedReceiveHash = flexCalcAccumulatorHash({ hashBefore: expectedReceiveHash, hashToAdd: newOrderHash });

        const hash = await publicClient.readContract({
          abi: flex.abi,
          address: flex.address,
          functionName: 'flexReceiveHash',
          args: [
            receiver,
            newNonce,
          ],
        });
        expect(hash).equal(expectedReceiveHash);
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
      expect(state).equal(FLEX_RECEIVE_STATE_RECEIVED);

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
  });
});
