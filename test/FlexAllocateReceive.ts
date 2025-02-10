import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import {
  getAbiItem,
  Hex,
  toFunctionSelector,
  toFunctionSignature,
  zeroAddress,
} from 'viem';

import {
  flexEncodeAllocateReceiveData0,
  FLEX_RECEIVE_NONCES_PER_BUCKET,
  FLEX_UNALLOCATED_HASH,
  FLEX_ALLOCATED_HASH,
} from '../@swaps-io/flex-sdk';

const TOTAL_ALLOCATE_BUCKETS = 5n;

describe('FlexAllocateReceive', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const receiveNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff'; // For standalone
    const confirmNativeDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone
    const confirmNativeProofDomain = '0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0'; // For standalone
    const refundNativeDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e'; // For standalone
    const refundNativeProofDomain = '0x3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a'; // For standalone
    const proofVerifier = zeroAddress; // For standalone

    // Includes `FlexAllocateReceiveFacet`
    const flexReceiveStandalone = await viem.deployContract(
      'FlexReceiveNativeStandalone',
      [
        receiveNativeDomain,
        confirmNativeDomain,
        confirmNativeProofDomain,
        refundNativeDomain,
        refundNativeProofDomain,
        proofVerifier,
      ],
    );

    const flexAllocateReceiveFacet = await viem.deployContract('FlexAllocateReceiveFacet');

    return {
      publicClient,
      walletClient,
      flexReceiveStandalone,
      flexAllocateReceiveFacet,
    };
  }

  it('Should show FlexAllocateReceiveFacet code', async function () {
    const { publicClient, flexAllocateReceiveFacet } = await loadFixture(deployFixture);

    const code = await publicClient.getCode({ address: flexAllocateReceiveFacet.address });
    console.log(`flexAllocateReceiveFacet code: ${code}`);
  });

  it('Should show FlexAllocateReceiveFacet function selectors', async function () {
    const { flexAllocateReceiveFacet } = await loadFixture(deployFixture);

    console.log('FlexAllocateReceiveFacet selectors:');
    for (const abi of flexAllocateReceiveFacet.abi) {
      if (abi.type !== 'function') {
        continue;
      }

      const item = getAbiItem({ abi: flexAllocateReceiveFacet.abi, name: abi.name });
      const signature = toFunctionSignature(item);
      const selector = toFunctionSelector(item);
      console.log(`- ${selector}: ${signature}`);
    }
  });

  it('Should allocate receive state', async function () {
    const { publicClient, walletClient, flexReceiveStandalone } = await loadFixture(deployFixture);

    const receiver = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const startNonce = 3n * FLEX_RECEIVE_NONCES_PER_BUCKET + 5n;
    const totalBuckets = TOTAL_ALLOCATE_BUCKETS;

    const startBucket = startNonce / FLEX_RECEIVE_NONCES_PER_BUCKET; // Included
    const endBucket = startBucket + totalBuckets; // Excluded

    const allocateData0 = flexEncodeAllocateReceiveData0({
      receiver,
      startNonce,
      totalBuckets,
    });

    async function readReceiveHash(nonce: bigint): Promise<Hex> {
      const hash = await publicClient.readContract({
        abi: flexReceiveStandalone.abi,
        address: flexReceiveStandalone.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      return hash;
    }

    {
      {
        const nonce = (startBucket - 1n) * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      for (let i = startBucket; i < endBucket; i++) {
        const nonce = i * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      {
        const nonce = endBucket * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }
    }

    {
      const hash = await walletClient.writeContract({
        abi: flexReceiveStandalone.abi,
        address: flexReceiveStandalone.address,
        functionName: 'flexAllocateReceive',
        args: [
          allocateData0,
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexAllocateReceive gas (${totalBuckets} buckets): ${receipt.gasUsed}`);
    }

    {
      {
        const nonce = (startBucket - 1n) * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }

      for (let i = startBucket; i < endBucket; i++) {
        const nonce = i * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_ALLOCATED_HASH);
      }

      {
        const nonce = endBucket * FLEX_RECEIVE_NONCES_PER_BUCKET;
        const hash = await readReceiveHash(nonce);
        expect(hash).equal(FLEX_UNALLOCATED_HASH);
      }
    }
  });
});
