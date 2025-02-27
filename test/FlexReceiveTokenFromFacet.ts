import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, encodeFunctionData, Hex, parseEventLogs, zeroAddress } from 'viem';

import {
  flexCalcReceiveTokenFromHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeReceiveTokenFromData,
  flexCalcBranch,
  FLEX_RECEIVE_STATE_NONE,
  FLEX_RECEIVE_STATE_RECEIVED,
  flexCalcReceiveAccumulatorHash,
  FLEX_UNALLOCATED_HASH,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here

describe('FlexReceiveTokenFromFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [senderClient, walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      senderClient,
      walletClient,
      flex,
      resolver,
      token,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexReceiveTokenFromFacet'));
  });

  it('Should receive token from', async function () {
    const { publicClient, senderClient, walletClient, flex, resolver, token } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const amount = 123_456_789n;
    const sender = senderClient.account.address;
    const senderContract = false;

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
    await senderClient.writeContract({
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

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const receiveTokenFromDomain = await publicClient.readContract({
      abi: flex.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenFromDomain',
      args: [],
    });
    const receiveTokenFromData = flexEncodeReceiveTokenFromData({
      sender,
      senderContract,
      receiver,
      token: token.address,
      amount,
      deadline,
      nonce,
    });
    const receiveTokenFromHash = flexCalcReceiveTokenFromHash({
      domain: receiveTokenFromDomain,
      data: receiveTokenFromData,
    });

    const componentHashes = [receiveTokenFromHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveTokenFromBranch = flexCalcBranch({ tree: orderTree, leaf: receiveTokenFromHash });

    const senderSignature = await senderClient.signMessage({ message: { raw: orderHash } });

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

      expectedReceiveHash = FLEX_UNALLOCATED_HASH;

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
        abi: resolver.abi,
        address: resolver.address,
        functionName: 'call',
        args: [
          flex.address,
          encodeFunctionData({
            abi: flex.abi,
            functionName: 'flexReceiveTokenFrom',
            args: [
              receiveTokenFromData.receivePackData[0],
              receiveTokenFromData.receiveData[1],
              receiveTokenFromData.receiveData[2],
              receiveTokenFromBranch,
              senderSignature,
            ],
          }),
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveTokenFrom gas (1st): ${receipt.gasUsed}`);

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

      expectedReceiveHash = flexCalcReceiveAccumulatorHash({ hashBefore: expectedReceiveHash, orderHash });

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
        abi: resolver.abi,
        address: resolver.address,
        functionName: 'call',
        args: [
          flex.address,
          encodeFunctionData({
            abi: flex.abi,
            functionName: 'flexReceiveTokenFrom',
            args: [
              receiveTokenFromData.receivePackData[0],
              receiveTokenFromData.receiveData[1],
              receiveTokenFromData.receiveData[2],
              receiveTokenFromBranch,
              senderSignature,
            ],
          }),
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

      const newReceiveTokenFromData = flexEncodeReceiveTokenFromData({
        sender,
        senderContract,
        receiver,
        token: token.address,
        amount,
        deadline,
        nonce: newNonce,
      });
      const newReceiveTokenFromHash = flexCalcReceiveTokenFromHash({
        domain: receiveTokenFromDomain,
        data: newReceiveTokenFromData,
      });

      const newComponentHashes = [newReceiveTokenFromHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newOrderHash = flexCalcTreeHash({ tree: newOrderTree });
      const newReceiveComponentBranch = flexCalcBranch({ tree: newOrderTree, leaf: newReceiveTokenFromHash });

      const newSenderSignature = await senderClient.signMessage({ message: { raw: newOrderHash } });


      const hash = await walletClient.writeContract({
        abi: resolver.abi,
        address: resolver.address,
        functionName: 'call',
        args: [
          flex.address,
          encodeFunctionData({
            abi: flex.abi,
            functionName: 'flexReceiveTokenFrom',
            args: [
              newReceiveTokenFromData.receivePackData[0],
              newReceiveTokenFromData.receiveData[1],
              newReceiveTokenFromData.receiveData[2],
              newReceiveComponentBranch,
              newSenderSignature,
            ],
          }),
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveTokenFrom gas (2nd): ${receipt.gasUsed}`);

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

        expectedReceiveHash = flexCalcReceiveAccumulatorHash({ hashBefore: expectedReceiveHash, orderHash: newOrderHash });

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
