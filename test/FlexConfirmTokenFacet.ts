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
  flexEncodeReceiveTokenData0,
  flexEncodeReceiveTokenData1,
  flexEncodeReceiveTokenData2,
  flexEncodeConfirmTokenData0,
  flexEncodeConfirmTokenData1,
  flexCalcReceiveTokenHash,
  flexCalcConfirmTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcReceiveTokenBranch,
  flexCalcConfirmTokenBranch,
  flexCalcAccumulatorHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexConfirmTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const receiveTokenDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const receiveTokenFromDomain = '0xbebebebebebebebebebebebebebebebebebebebebebebebebebebebebebebebe'; // For standalone
    const confirmTokenDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const confirmTokenProofDomain = '0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0'; // For standalone
    const refundTokenDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e'; // For standalone
    const refundTokenProofDomain = '0x3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a'; // For standalone
    const proofVerifier = zeroAddress; // For standalone

    let flex: { address: Address };
    let flexReceiveTokenFacet: ContractTypesMap['FlexReceiveTokenFacet'];
    let flexReceiveTokenDomainFacet: ContractTypesMap['FlexReceiveTokenDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];
    let flexConfirmTokenFacet: ContractTypesMap['FlexConfirmTokenFacet'];
    let flexConfirmTokenDomainFacet: ContractTypesMap['FlexConfirmTokenDomainFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveTokenFacet = await viem.deployContract('FlexReceiveTokenFacet', [receiveTokenDomain]);
      flexReceiveTokenDomainFacet = await viem.deployContract('FlexReceiveTokenDomainFacet', [receiveTokenDomain]);
      flexReceiveStateFacet = await viem.deployContract('FlexReceiveStateFacet');
      flexReceiveHashFacet = await viem.deployContract('FlexReceiveHashFacet');
      flexConfirmTokenFacet = await viem.deployContract('FlexConfirmTokenFacet', [confirmTokenDomain, receiveTokenDomain]);
      flexConfirmTokenDomainFacet = await viem.deployContract('FlexConfirmTokenDomainFacet', [confirmTokenDomain]);

      flex = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
      await walletClient.writeContract({
        abi: diamondCutFacet.abi,
        address: flex.address,
        functionName: 'diamondCut',
        args: [
          [
            {
              action: 0, // Add
              facetAddress: flexReceiveTokenFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenFacet.abi,
                    name: 'flexReceiveToken',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexReceiveTokenDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexReceiveTokenDomainFacet.abi,
                    name: 'flexReceiveTokenDomain',
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
              facetAddress: flexConfirmTokenFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexConfirmTokenFacet.abi,
                    name: 'flexConfirmToken',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexConfirmTokenDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexConfirmTokenDomainFacet.abi,
                    name: 'flexConfirmTokenDomain',
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
        'FlexReceiveTokenStandalone',
        [
          receiveTokenDomain,
          receiveTokenFromDomain,
          confirmTokenDomain,
          confirmTokenProofDomain,
          refundTokenDomain,
          refundTokenProofDomain,
          proofVerifier,
        ],
      );

      flexReceiveTokenFacet = flex as ContractTypesMap['FlexReceiveTokenFacet'];
      flexReceiveTokenDomainFacet = flex as ContractTypesMap['FlexReceiveTokenDomainFacet'];
      flexReceiveStateFacet = flex as ContractTypesMap['FlexReceiveStateFacet'];
      flexReceiveHashFacet = flex as ContractTypesMap['FlexReceiveHashFacet'];
      flexConfirmTokenFacet = flex as ContractTypesMap['FlexConfirmTokenFacet'];
      flexConfirmTokenDomainFacet = flex as ContractTypesMap['FlexConfirmTokenDomainFacet'];
    }

    const resolver = await viem.deployContract('ResolverTest');

    const token = await viem.deployContract('TokenTest');

    return {
      publicClient,
      walletClient,
      resolver,
      flex,
      flexReceiveTokenFacet,
      flexReceiveTokenDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexConfirmTokenFacet,
      flexConfirmTokenDomainFacet,
      token,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexConfirmTokenFacet code', async function () {
      const { publicClient, flexConfirmTokenFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexConfirmTokenFacet.address });
      console.log(`FlexConfirmTokenFacet code: ${code}`);
    });

    it('Should show FlexConfirmTokenDomainFacet code', async function () {
      const { publicClient, flexConfirmTokenDomainFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexConfirmTokenDomainFacet.address });
      console.log(`FlexConfirmTokenDomainFacet code: ${code}`);
    });

    it('Should show FlexConfirmTokenFacet function selectors', async function () {
      const { flexConfirmTokenFacet } = await loadFixture(deployFixture);

      console.log('FlexConfirmTokenFacet selectors:');
      for (const abi of flexConfirmTokenFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexConfirmTokenFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexConfirmTokenDomainFacet function selectors', async function () {
      const { flexConfirmTokenDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexConfirmTokenDomainFacet selectors:');
      for (const abi of flexConfirmTokenDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexConfirmTokenDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should confirm token', async function () {
    const {
      flex,
      flexReceiveTokenFacet,
      flexReceiveTokenDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexConfirmTokenFacet,
      flexConfirmTokenDomainFacet,
      walletClient,
      publicClient,
      resolver,
      token,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const amount = 123_456_789n;

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
        walletClient.account.address,
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
        resolver.address,
        existingReceiverAmount,
      ],
    });

    // Imaginary data. Gas doesn't include signature check implementation by resolver (like ECDSA recover)
    const receiverSignature = bytesToHex(crypto.getRandomValues(new Uint8Array(IMAGINARY_RECEIVER_SIGNATURE_BYTES)));

    const receiveDomain = await publicClient.readContract({
      abi: flexReceiveTokenDomainFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveTokenDomain',
      args: [],
    });
    const receiveData0 = flexEncodeReceiveTokenData0({
      deadline,
      nonce,
      receiver,
    });
    const receiveData1 = flexEncodeReceiveTokenData1({
      amount,
    });
    const receiveData2 = flexEncodeReceiveTokenData2({
      token: token.address,
    });
    const receiveHash = flexCalcReceiveTokenHash({
      domain: receiveDomain,
      data0: receiveData0,
      data1: receiveData1,
      data2: receiveData2,
    });

    const confirmDomain = await publicClient.readContract({
      abi: flexConfirmTokenDomainFacet.abi,
      address: flex.address,
      functionName: 'flexConfirmTokenDomain',
      args: [],
    });
    const confirmData0 = flexEncodeConfirmTokenData0({
      keyHash: confirmKeyHash,
    });
    const confirmData1 = flexEncodeConfirmTokenData1({
      receiveTokenHash: receiveHash,
    });
    const confirmHash = flexCalcConfirmTokenHash({
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

    const receiveComponentBranch = flexCalcReceiveTokenBranch({
      tree: orderTree,
      receiveTokenHash: receiveHash,
    });
    const confirmComponentBranch = flexCalcConfirmTokenBranch({
      tree: orderTree,
      confirmTokenHash: confirmHash,
    });

    await expect(
      walletClient.writeContract({
        abi: flexConfirmTokenFacet.abi,
        address: flex.address,
        functionName: 'flexConfirmToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
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
      abi: flexReceiveTokenFacet.abi,
      address: flex.address,
      functionName: 'flexReceiveToken',
      args: [
        receiveData0,
        receiveData1,
        receiveData2,
        receiveComponentBranch,
        receiverSignature,
      ],
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

      expectedReceiveHash = flexCalcAccumulatorHash({ accumulatorHash: zeroAddress, hashToAdd: orderHash });

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

    const receiverBalanceBefore = await publicClient.readContract({
      abi: token.abi,
      address: token.address,
      functionName: 'balanceOf',
      args: [
        receiver,
      ],
    });

    {
      const hash = await walletClient.writeContract({
        abi: flexConfirmTokenFacet.abi,
        address: flex.address,
        functionName: 'flexConfirmToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          confirmData0,
          confirmKey,
          confirmComponentBranch,
          zeroAddress, // receiveHashBefore
          [], // receiveOrderHashesAfter
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexConfirmToken gas: ${receipt.gasUsed}`);

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
            receiver,
          ],
        });
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
