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
  flexEncodeRefundTokenData0,
  flexEncodeRefundTokenData1,
  flexEncodeRefundTokenData2,
  flexCalcReceiveTokenHash,
  flexCalcRefundTokenHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexCalcReceiveTokenBranch,
  flexCalcRefundTokenBranch,
  flexCalcAccumulatorHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 2; // Implied in order, but not used here
const IMAGINARY_RECEIVER_SIGNATURE_BYTES = 65; // Not verified, dummy contract call
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexRefundTokenFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient] = await viem.getWalletClients();

    const receiveTokenDomain = '0xc0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ffeec0ff';
    const receiveTokenFromDomain = '0xbebebebebebebebebebebebebebebebebebebebebebebebebebebebebebebebe'; // For standalone
    const confirmTokenDomain = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'; // For standalone
    const confirmTokenProofDomain = '0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0'; // For standalone
    const refundTokenDomain = '0x4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e4e';
    const refundTokenProofDomain = '0x3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a3a'; // For standalone
    const proofVerifier = zeroAddress; // For standalone

    let flex: { address: Address };
    let flexReceiveTokenFacet: ContractTypesMap['FlexReceiveTokenFacet'];
    let flexReceiveTokenDomainFacet: ContractTypesMap['FlexReceiveTokenDomainFacet'];
    let flexReceiveStateFacet: ContractTypesMap['FlexReceiveStateFacet'];
    let flexReceiveHashFacet: ContractTypesMap['FlexReceiveHashFacet'];
    let flexRefundTokenFacet: ContractTypesMap['FlexRefundTokenFacet'];
    let flexRefundTokenDomainFacet: ContractTypesMap['FlexRefundTokenDomainFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexReceiveTokenFacet = await viem.deployContract('FlexReceiveTokenFacet', [receiveTokenDomain]);
      flexReceiveTokenDomainFacet = await viem.deployContract('FlexReceiveTokenDomainFacet', [receiveTokenDomain]);
      flexReceiveStateFacet = await viem.deployContract('FlexReceiveStateFacet');
      flexReceiveHashFacet = await viem.deployContract('FlexReceiveHashFacet');
      flexRefundTokenFacet = await viem.deployContract('FlexRefundTokenFacet', [refundTokenDomain, receiveTokenDomain]);
      flexRefundTokenDomainFacet = await viem.deployContract('FlexRefundTokenDomainFacet', [refundTokenDomain]);

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
              facetAddress: flexRefundTokenFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexRefundTokenFacet.abi,
                    name: 'flexRefundToken',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexRefundTokenDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexRefundTokenDomainFacet.abi,
                    name: 'flexRefundTokenDomain',
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
      flexRefundTokenFacet = flex as ContractTypesMap['FlexRefundTokenFacet'];
      flexRefundTokenDomainFacet = flex as ContractTypesMap['FlexRefundTokenDomainFacet'];
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
      flexRefundTokenFacet,
      flexRefundTokenDomainFacet,
      token,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexRefundTokenFacet code', async function () {
      const { publicClient, flexRefundTokenFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexRefundTokenFacet.address });
      console.log(`FlexRefundTokenFacet code: ${code}`);
    });

    it('Should show FlexRefundTokenDomainFacet code', async function () {
      const { publicClient, flexRefundTokenDomainFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexRefundTokenDomainFacet.address });
      console.log(`FlexRefundTokenDomainFacet code: ${code}`);
    });

    it('Should show FlexRefundTokenFacet function selectors', async function () {
      const { flexRefundTokenFacet } = await loadFixture(deployFixture);

      console.log('FlexRefundTokenFacet selectors:');
      for (const abi of flexRefundTokenFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexRefundTokenFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexRefundTokenDomainFacet function selectors', async function () {
      const { flexRefundTokenDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexRefundTokenDomainFacet selectors:');
      for (const abi of flexRefundTokenDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexRefundTokenDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should refund token', async function () {
    const {
      flex,
      flexReceiveTokenFacet,
      flexReceiveTokenDomainFacet,
      flexReceiveStateFacet,
      flexReceiveHashFacet,
      flexRefundTokenFacet,
      flexRefundTokenDomainFacet,
      walletClient,
      publicClient,
      resolver,
      token,
    } = await loadFixture(deployFixture);

    const deadline = 4_000_000_000n;
    const nonce = 424_242n;
    const receiver = resolver.address;
    const receiverContract = true;
    const refundReceiver = walletClient.account.address;
    const amount = 123_456_789n;

    const refundKey = '0x5ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8e15ec8' as const;
    const refundKeyHash = keccak256(refundKey);

    const remainingSenderAmount = 111_222n;
    const remainingSenderAllowance = 55_777n;
    const existingFlexAmount = 2_496n;
    const existingRefundReceiverAmount = 1_337n;

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
        refundReceiver,
        existingRefundReceiverAmount,
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
      receiverContract,
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

    const refundDomain = await publicClient.readContract({
      abi: flexRefundTokenDomainFacet.abi,
      address: flex.address,
      functionName: 'flexRefundTokenDomain',
      args: [],
    });
    const refundData0 = flexEncodeRefundTokenData0({
      keyHash: refundKeyHash,
    });
    const refundData1 = flexEncodeRefundTokenData1({
      receiver: refundReceiver,
    });
    const refundData2 = flexEncodeRefundTokenData2({
      receiveTokenHash: receiveHash,
    });
    const refundHash = flexCalcRefundTokenHash({
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
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });

    const receiveComponentBranch = flexCalcReceiveTokenBranch({
      tree: orderTree,
      receiveTokenHash: receiveHash,
    });
    const refundComponentBranch = flexCalcRefundTokenBranch({
      tree: orderTree,
      refundTokenHash: refundHash,
    });

    await expect(
      walletClient.writeContract({
        abi: flexRefundTokenFacet.abi,
        address: flex.address,
        functionName: 'flexRefundToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
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
    const refundReceiverBalanceBefore = await publicClient.readContract({
      abi: token.abi,
      address: token.address,
      functionName: 'balanceOf',
      args: [
        refundReceiver,
      ],
    });

    {
      const hash = await walletClient.writeContract({
        abi: flexRefundTokenFacet.abi,
        address: flex.address,
        functionName: 'flexRefundToken',
        args: [
          receiveData0,
          receiveData1,
          receiveData2,
          refundData0,
          refundData1,
          refundKey,
          refundComponentBranch,
          zeroAddress, // receiveHashBefore
          [], // receiveOrderHashesAfter
        ],
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexRefundToken gas: ${receipt.gasUsed}`);

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
        expect(balance).equal(receiverBalanceBefore);
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
        expect(balance - refundReceiverBalanceBefore).equal(amount);
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
