import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { ContractTypesMap } from 'hardhat/types/artifacts';
import { Address, bytesToHex, concat, getAbiItem, Hex, keccak256, sliceHex, toFunctionSelector, toFunctionSignature, zeroAddress } from 'viem';
import { expect } from 'chai';

import {
  encodeFlexReceiveNativeData0,
  encodeFlexReceiveNativeData1,
  encodeFlexRefundNativeData0,
  encodeFlexRefundNativeData1,
  encodeFlexRefundNativeData2,
  calcFlexReceiveNativeHash,
  calcFlexRefundNativeHash,
  calcFlexTree,
  calcFlexTreeHash,
  calcFlexReceiveNativeBranch,
  calcFlexRefundNativeBranch,
  calcFlexAccumulatorHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexRefundNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const flexReceiveNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const flexConfirmNativeDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone
    const flexRefundNativeDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e';

    let flex: { address: Address };
    let flexReceiveNativeFacet: ContractTypesMap['FlexReceiveNativeFacet'];
    let flexReceiveNativeDomainFacet: ContractTypesMap['FlexReceiveNativeDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];
    let flexRefundNativeFacet: ContractTypesMap['FlexRefundNativeFacet'];
    let flexRefundNativeDomainFacet: ContractTypesMap['FlexRefundNativeDomainFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveNativeFacet = await viem.deployContract('FlexReceiveNativeFacet', [flexReceiveNativeDomain]);
      flexReceiveNativeDomainFacet = await viem.deployContract('FlexReceiveNativeDomainFacet', [flexReceiveNativeDomain]);
      flexReceiveStateFacet = await viem.deployContract('FlexReceiveStateFacet');
      flexReceiveHashFacet = await viem.deployContract('FlexReceiveHashFacet');
      flexRefundNativeFacet = await viem.deployContract('FlexRefundNativeFacet', [flexRefundNativeDomain, flexReceiveNativeDomain]);
      flexRefundNativeDomainFacet = await viem.deployContract('FlexRefundNativeDomainFacet', [flexRefundNativeDomain]);

      flex = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
      await walletClient.writeContract({
        abi: diamondCutFacet.abi,
        address: flex.address,
        functionName: 'diamondCut',
        args: [
          [
            {
              action: 0, // Add
              facetAddress: flexReceiveNativeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveNativeFacet.abi,
                    name: 'flexReceiveNative',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveNativeDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveNativeDomainFacet.abi,
                    name: 'flexReceiveNativeDomain',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveStateFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveStateFacet.abi,
                    name: 'flexReceiveState',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveHashFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveHashFacet.abi,
                    name: 'flexReceiveHash',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexRefundNativeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexRefundNativeFacet.abi,
                    name: 'flexRefundNative',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexRefundNativeDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexRefundNativeDomainFacet.abi,
                    name: 'flexRefundNativeDomain',
                  }),
                ),
              ],
            },
          ],
          zeroAddress,
          '0x',
        ],
      });
    } else {
      flex = await viem.deployContract(
        'FlexReceiveNativeStandalone',
        [
          flexReceiveNativeDomain,
          flexConfirmNativeDomain,
          flexRefundNativeDomain,
        ],
      );

      flexReceiveNativeFacet = flex as ContractTypesMap['FlexReceiveNativeFacet'];
      flexReceiveNativeDomainFacet = flex as ContractTypesMap['FlexReceiveNativeDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
      flexRefundNativeFacet = flex as ContractTypesMap['FlexRefundNativeFacet'];
      flexRefundNativeDomainFacet = flex as ContractTypesMap['FlexRefundNativeDomainFacet'];
    }

    const resolver = await viem.deployContract('ResolverTest');

    return {
      publicClient,
      walletClient,
      resolver,
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexRefundNativeFacet,
      flexRefundNativeDomainFacet,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexRefundNativeFacet code', async function () {
      const { publicClient, flexRefundNativeFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexRefundNativeFacet.address });
      console.log(`FlexRefundNativeFacet code: ${code}`);
    });

    it('Should show FlexRefundNativeDomainFacet code', async function () {
      const { publicClient, flexRefundNativeDomainFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexRefundNativeDomainFacet.address });
      console.log(`FlexRefundNativeDomainFacet code: ${code}`);
    });

    it('Should show FlexRefundNativeFacet function selectors', async function () {
      const { flexRefundNativeFacet } = await loadFixture(deployFixture);

      console.log('FlexRefundNativeFacet selectors:');
      for (const abi of flexRefundNativeFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexRefundNativeFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexRefundNativeDomainFacet function selectors', async function () {
      const { flexRefundNativeDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexRefundNativeDomainFacet selectors:');
      for (const abi of flexRefundNativeDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexRefundNativeDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should refund native', async function () {
    const {
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexRefundNativeFacet,
      flexRefundNativeDomainFacet,
      walletClient,
      publicClient,
      resolver,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const refundReceiver = walletClient.account.address;
    const amount = 123_456_789n;

    const refundKey = '0x5ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8' as const;
    const refundKeyHash = keccak256(refundKey);

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveDomain = await publicClient.readContract({
      abi: flexReceiveNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveNativeDomain',
      args: [],
    });
    const receiveData0 = encodeFlexReceiveNativeData0({
      deadline,
      nonce,
      receiver,
    });
    const receiveData1 = encodeFlexReceiveNativeData1({
      amount,
    });
    const receiveHash = calcFlexReceiveNativeHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
    });

    const refundDomain = await publicClient.readContract({
      abi: flexRefundNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexRefundNativeDomain',
      args: [],
    });
    const refundData0 = encodeFlexRefundNativeData0({
      keyHash: refundKeyHash,
    });
    const refundData1 = encodeFlexRefundNativeData1({
      receiver: refundReceiver,
    });
    const refundData2 = encodeFlexRefundNativeData2({
      receiveNativeHash: receiveHash,
    });
    const refundHash = calcFlexRefundNativeHash({
      domain: refundDomain,
      data0: refundData0,
      data1: refundData1,
      data2: refundData2,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveHash, refundHash, ...imaginaryComponentHashes];
    const orderTree = calcFlexTree({ leaves: componentHashes });
    const orderHash = calcFlexTreeHash({ tree: orderTree });

    const receiveComponentBranch = calcFlexReceiveNativeBranch({
      tree: orderTree,
      receiveNativeHash: receiveHash,
    });
    const refundComponentBranch = calcFlexRefundNativeBranch({
      tree: orderTree,
      refundNativeHash: refundHash,
    });

    await expect(
      walletClient.writeContract({
        abi: flexRefundNativeFacet.abi,
        address: flex.address,
        functionName: 'flexRefundNative',
        args: [
          receiveData0,
          receiveData1,
          refundData0,
          refundData1,
          refundKey,
          refundComponentBranch,
          zeroAddress, // receiveHashBefore
          [], // receiveOrderHashesAfter
        ],
      }),
    ).rejectedWith(
      'FlexStateError()', // Order with receiver nonce not in `Received` state yet
    );

    await walletClient.writeContract({
      abi: flexReceiveNativeFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveNative',
      args: [
        receiveData0,
        receiveComponentBranch,
        receiverSignature,
      ],
      value: amount,
    });

    let expectedReceiveHash: Hex;
    {
      const state = await publicClient.readContract({
        abi: flexReceiveStateFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(1); // FlexReceiveState.Received

      expectedReceiveHash = calcFlexAccumulatorHash({ accumulatorHash: zeroAddress, hashToAdd: orderHash });

      const hash = await publicClient.readContract({
        abi: flexReceiveHashFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveHash',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(hash).equal(expectedReceiveHash);
    }

    const receiverBalanceBefore = await publicClient.getBalance({ address: receiver });
    const refundReceiverBalanceBefore = await publicClient.getBalance({ address: refundReceiver });

    {
      const hash = await walletClient.writeContract({
        abi: flexRefundNativeFacet.abi,
        address: flex.address,
        functionName: 'flexRefundNative',
        args: [
          receiveData0,
          receiveData1,
          refundData0,
          refundData1,
          refundKey,
          refundComponentBranch,
          zeroAddress, // receiveHashBefore
          [], // receiveOrderHashesAfter
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexRefundNative gas: ${receipt.gasUsed}`);

      const txCost = receipt.gasUsed * receipt.effectiveGasPrice;

      {
        const balance = await publicClient.getBalance({ address: flex.address });
        expect(balance).equal(0n);
      }
      {
        const balance = await publicClient.getBalance({ address: receiver });
        expect(balance).equal(receiverBalanceBefore);
      }
      {
        const balance = await publicClient.getBalance({ address: refundReceiver });
        expect(balance + txCost - refundReceiverBalanceBefore).equal(amount);
      }
    }

    {
      const state = await publicClient.readContract({
        abi: flexReceiveStateFacet.abi,
        address: flex.address,
        functionName: 'flexReceiveState',
        args: [
          receiver,
          nonce,
        ],
      });
      expect(state).equal(3); // FlexReceiveState.Refunded
    }
  });
});
