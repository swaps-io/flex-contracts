import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { ContractTypesMap } from 'hardhat/types/artifacts';
import { expect } from 'chai';
import {
  Address,
  bytesToHex,
  getAbiItem,
  Hex,
  keccak256,
  toFunctionSelector,
  toFunctionSignature,
  zeroAddress,
} from 'viem';

import {
  flexEncodeReceiveNativeData0,
  flexEncodeReceiveNativeData1,
  flexEncodeConfirmNativeData0,
  flexEncodeConfirmNativeData1,
  flexCalcReceiveNativeHash,
  flexCalcConfirmNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcReceiveNativeBranch,
  flexCalcConfirmNativeBranch,
  flexCalcAccumulatorHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexConfirmNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const receiveNativeDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const confirmNativeDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const confirmNativeProofDomain = '0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0'; // For standalone
    const refundNativeDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e'; // For standalone
    const refundNativeProofDomain = '0x3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a'; // For standalone
    const proofVerifier = zeroAddress; // For standalone

    let flex: { address: Address };
    let flexReceiveNativeFacet: ContractTypesMap['FlexReceiveNativeFacet'];
    let flexReceiveNativeDomainFacet: ContractTypesMap['FlexReceiveNativeDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];
    let flexConfirmNativeFacet: ContractTypesMap['FlexConfirmNativeFacet'];
    let flexConfirmNativeDomainFacet: ContractTypesMap['FlexConfirmNativeDomainFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveNativeFacet = await viem.deployContract('FlexReceiveNativeFacet', [receiveNativeDomain]);
      flexReceiveNativeDomainFacet = await viem.deployContract('FlexReceiveNativeDomainFacet', [receiveNativeDomain]);
      flexReceiveStateFacet = await viem.deployContract('FlexReceiveStateFacet');
      flexReceiveHashFacet = await viem.deployContract('FlexReceiveHashFacet');
      flexConfirmNativeFacet = await viem.deployContract('FlexConfirmNativeFacet', [confirmNativeDomain, receiveNativeDomain]);
      flexConfirmNativeDomainFacet = await viem.deployContract('FlexConfirmNativeDomainFacet', [confirmNativeDomain]);

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
              facetAddress: flexConfirmNativeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexConfirmNativeFacet.abi,
                    name: 'flexConfirmNative',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexConfirmNativeDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexConfirmNativeDomainFacet.abi,
                    name: 'flexConfirmNativeDomain',
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
          receiveNativeDomain,
          confirmNativeDomain,
          confirmNativeProofDomain,
          refundNativeDomain,
          refundNativeProofDomain,
          proofVerifier,
        ],
      );

      flexReceiveNativeFacet = flex as ContractTypesMap['FlexReceiveNativeFacet'];
      flexReceiveNativeDomainFacet = flex as ContractTypesMap['FlexReceiveNativeDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
      flexConfirmNativeFacet = flex as ContractTypesMap['FlexConfirmNativeFacet'];
      flexConfirmNativeDomainFacet = flex as ContractTypesMap['FlexConfirmNativeDomainFacet'];
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
      flexConfirmNativeFacet,
      flexConfirmNativeDomainFacet,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexConfirmNativeFacet code', async function () {
      const { publicClient, flexConfirmNativeFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexConfirmNativeFacet.address });
      console.log(`FlexConfirmNativeFacet code: ${code}`);
    });

    it('Should show FlexConfirmNativeDomainFacet code', async function () {
      const { publicClient, flexConfirmNativeDomainFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexConfirmNativeDomainFacet.address });
      console.log(`FlexConfirmNativeDomainFacet code: ${code}`);
    });

    it('Should show FlexConfirmNativeFacet function selectors', async function () {
      const { flexConfirmNativeFacet } = await loadFixture(deployFixture);

      console.log('FlexConfirmNativeFacet selectors:');
      for (const abi of flexConfirmNativeFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexConfirmNativeFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexConfirmNativeDomainFacet function selectors', async function () {
      const { flexConfirmNativeDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexConfirmNativeDomainFacet selectors:');
      for (const abi of flexConfirmNativeDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexConfirmNativeDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should confirm native', async function () {
    const {
      flex,
      flexReceiveNativeFacet,
      flexReceiveNativeDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexConfirmNativeFacet,
      flexConfirmNativeDomainFacet,
      walletClient,
      publicClient,
      resolver,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const amount = 123_456_789n;

    const confirmKey = '0x5ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8' as const;
    const confirmKeyHash = keccak256(confirmKey);

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveDomain = await publicClient.readContract({
      abi: flexReceiveNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveNativeDomain',
      args: [],
    });
    const receiveData0 = flexEncodeReceiveNativeData0({
      deadline,
      nonce,
      receiver,
      receiverContract,
    });
    const receiveData1 = flexEncodeReceiveNativeData1({
      amount,
    });
    const receiveHash = flexCalcReceiveNativeHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
    });

    const confirmDomain = await publicClient.readContract({
      abi: flexConfirmNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexConfirmNativeDomain',
      args: [],
    });
    const confirmData0 = flexEncodeConfirmNativeData0({
      keyHash: confirmKeyHash,
    });
    const confirmData1 = flexEncodeConfirmNativeData1({
      receiveNativeHash: receiveHash,
    });
    const confirmHash = flexCalcConfirmNativeHash({
      domain: confirmDomain,
      data0: confirmData0,
      data1: confirmData1,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [receiveHash, confirmHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });

    const receiveComponentBranch = flexCalcReceiveNativeBranch({
      tree: orderTree,
      receiveNativeHash: receiveHash,
    });
    const confirmComponentBranch = flexCalcConfirmNativeBranch({
      tree: orderTree,
      confirmNativeHash: confirmHash,
    });

    await expect(
      walletClient.writeContract({
        abi: flexConfirmNativeFacet.abi,
        address: flex.address,
        functionName: 'flexConfirmNative',
        args: [
          receiveData0,
          receiveData1,
          confirmData0,
          confirmKey,
          confirmComponentBranch,
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

      expectedReceiveHash = flexCalcAccumulatorHash({ hashBefore: zeroAddress, hashToAdd: orderHash });

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

    {
      const hash = await walletClient.writeContract({
        abi: flexConfirmNativeFacet.abi,
        address: flex.address,
        functionName: 'flexConfirmNative',
        args: [
          receiveData0,
          receiveData1,
          confirmData0,
          confirmKey,
          confirmComponentBranch,
          zeroAddress, // receiveHashBefore
          [], // receiveOrderHashesAfter
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexConfirmNative gas: ${receipt.gasUsed}`);

      {
        const balance = await publicClient.getBalance({ address: flex.address });
        expect(balance).equal(0n);
      }
      {
        const balance = await publicClient.getBalance({ address: receiver });
        expect(balance - receiverBalanceBefore).equal(amount);
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
      expect(state).equal(2); // FlexReceiveState.Confirmed
    }
  });
});
