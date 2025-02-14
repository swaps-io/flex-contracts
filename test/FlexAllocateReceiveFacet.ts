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

describe('FlexAllocateReceiveFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flex = await viem.deployContract('FlexStandalone', [zeroAddress]);
    const facet = await viem.deployContract('FlexAllocateReceiveFacet');

    return {
      publicClient,
      walletClient,
      flex,
      facet,
    };
  }

  it('Should show facet code', async function () {
    const { publicClient, facet } = await loadFixture(deployFixture);

    const code = await publicClient.getCode({ address: facet.address });
    console.log(`Facet code: ${code}`);
  });

  it('Should show facet selectors', async function () {
    const { facet } = await loadFixture(deployFixture);

    console.log('Facet selectors:');
    for (const abi of facet.abi) {
      if (abi.type === 'function') {
        const item = getAbiItem({ abi: facet.abi, name: abi.name });
        console.log(`- ${toFunctionSelector(item)}: ${toFunctionSignature(item)}`);
      }
    }
  });

  it('Should allocate receive state', async function () {
    const { publicClient, walletClient, flex } = await loadFixture(deployFixture);

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
        abi: flex.abi,
        address: flex.address,
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
        abi: flex.abi,
        address: flex.address,
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
