import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { expect } from 'chai';
import { bytesToHex, Hex, zeroAddress } from 'viem';

import {
  flexCalcReceiveNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcAccumulatorHash,
  flexEncodeReceiveNativeData,
  flexCalcBranch,
  FLEX_RECEIVE_STATE_REFUNDED,
  FLEX_RECEIVE_STATE_NONE,
  FLEX_RECEIVE_STATE_RECEIVED,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65;

describe('FlexReceiveNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      flex,
      resolver,
    };
  }

  it('Should show facet info', async function () {
    const { facetInfo } = await import('./utils/facetInfo');
    await facetInfo(await viem.deployContract('FlexReceiveNativeFacet'));
  });

  it('Should receive native', async function () {
    const { publicClient, walletClient, flex, resolver } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;
    const sender = walletClient.account.address;

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

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

    const componentHashes = [receiveNativeHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });
    const receiveNativeBranch = flexCalcBranch({ tree: orderTree, leaf: receiveNativeHash });

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
        functionName: 'flexReceiveNative',
        args: [
          receiveNativeData.receiveData[0],
          receiveNativeBranch,
          receiverSignature,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveNative gas (1st): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: flex.address });
      expect(balance).equal(amount);
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
        functionName: 'flexReceiveNative',
        args: [
          receiveNativeData.receiveData[0],
          receiveNativeBranch,
          receiverSignature,
        ],
        value: amount,
      }),
    ).rejectedWith(
      'FlexStateError()', // Same order used (receiver nonce already in `Received` state)
    );

    return; // TODO

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

      const newReceiveData0 = flexEncodeReceiveNativeData0({
        deadline,
        nonce: newNonce,
        receiver,
        receiverContract,
      });
      const newReceiveHash = flexCalcReceiveNativeHash({
        domain: receiveDomain,
        data0: newReceiveData0,
        data1: receiveData1,
      });

      const newComponentHashes = [newReceiveHash, ...imaginaryComponentHashes];
      const newOrderTree = flexCalcTree({ leaves: newComponentHashes });
      const newOrderHash = flexCalcTreeHash({ tree: newOrderTree });

      const receiveComponentBranch = flexCalcReceiveNativeBranch({
        tree: newOrderTree,
        receiveNativeHash: newReceiveHash,
      });

      const hash = await walletClient.writeContract({
        abi: flex.abi,
        address: flex.address,
        functionName: 'flexReceiveNative',
        args: [
          newReceiveData0,
          receiveComponentBranch,
          receiverSignature,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexReceiveNative gas (2nd): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: flex.address });
      expect(balance).equal(amount + amount);

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
      expect(state).equal(FLEX_RECEIVE_STATE_REFUNDED);

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
