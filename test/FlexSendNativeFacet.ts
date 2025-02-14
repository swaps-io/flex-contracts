import { viem } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers';
import { ContractTypesMap } from 'hardhat/types/artifacts';
import { expect } from 'chai';
import {
  Address,
  bytesToHex,
  getAbiItem,
  Hex,
  toFunctionSelector,
  toFunctionSignature,
  zeroAddress,
} from 'viem';

import {
  flexCalcSendNativeBranch,
  flexCalcSendNativeHash,
  flexCalcTree,
  flexCalcTreeHash,
  flexEncodeSendNativeData0,
  flexEncodeSendNativeData1,
  flexEncodeSendNativeData2,
  flexCalcAccumulatorHash,
} from '../@swaps-io/flex-sdk';

const IMAGINARY_COMPONENTS = 3; // Implied in order, but not used here
const INSIDE_DIAMOND = false; // Diamond or standalone

describe('FlexSendNativeFacet', function () {
  async function deployFixture() {
    const publicClient = await viem.getPublicClient();

    const [walletClient, resolverClient] = await viem.getWalletClients();

    const sendNativeDomain = '0xabababababababababababababababababababababababababababababababab';
    const sendTokenDomain = '0xcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd'; // For standalone

    let flex: { address: Address };
    let flexSendNativeFacet: ContractTypesMap['FlexSendNativeFacet'];
    let flexSendNativeDomainFacet: ContractTypesMap['FlexSendNativeDomainFacet'];
    let flexSendTimeFacet: ContractTypesMap['FlexSendTimeFacet'];
    let flexSendHashFacet: ContractTypesMap['FlexSendHashFacet'];

    if (INSIDE_DIAMOND) {
      const diamondCutFacet = await viem.deployContract('DiamondCutFacet');

      flexSendNativeFacet = await viem.deployContract('FlexSendNativeFacet', [sendNativeDomain]);
      flexSendNativeDomainFacet = await viem.deployContract('FlexSendNativeDomainFacet', [sendNativeDomain]);
      flexSendTimeFacet = await viem.deployContract('FlexSendTimeFacet');
      flexSendHashFacet = await viem.deployContract('FlexSendHashFacet');

      flex = await viem.deployContract('Diamond', [walletClient.account.address, diamondCutFacet.address]);
      await walletClient.writeContract({
        abi: diamondCutFacet.abi,
        address: flex.address,
        functionName: 'diamondCut',
        args: [
          [
            {
              action: 0, // Add
              facetAddress: flexSendNativeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendNativeFacet.abi,
                    name: 'flexSendNative',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendNativeDomainFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendNativeDomainFacet.abi,
                    name: 'flexSendNativeDomain',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendTimeFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendTimeFacet.abi,
                    name: 'flexSendTime',
                  }),
                ),
              ],
            },
            {
              action: 0, // Add
              facetAddress: flexSendHashFacet.address,
              functionSelectors: [
                toFunctionSelector(
                  getAbiItem({
                    abi: flexSendHashFacet.abi,
                    name: 'flexSendHash',
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
        'FlexSendStandalone',
        [
          sendNativeDomain,
          sendTokenDomain,
        ],
      );

      flexSendNativeFacet = flex as ContractTypesMap['FlexSendNativeFacet'];
      flexSendNativeDomainFacet = flex as ContractTypesMap['FlexSendNativeDomainFacet'];
      flexSendTimeFacet = flex as ContractTypesMap['FlexSendTimeFacet'];
      flexSendHashFacet = flex as ContractTypesMap['FlexSendHashFacet'];
    }

    return {
      publicClient,
      walletClient,
      resolverClient,
      flex,
      flexSendNativeFacet,
      flexSendNativeDomainFacet,
      flexSendTimeFacet,
      flexSendHashFacet,
    };
  }

  //
  if (INSIDE_DIAMOND) {
  //

    it('Should show FlexSendNativeFacet code', async function () {
      const { publicClient, flexSendNativeFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexSendNativeFacet.address });
      console.log(`FlexSendNativeFacet code: ${code}`);
    });

    it('Should show FlexSendNativeDomainFacet code', async function () {
      const { publicClient, flexSendNativeDomainFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexSendNativeDomainFacet.address });
      console.log(`FlexSendNativeDomainFacet code: ${code}`);
    });

    it('Should show FlexSendTimeFacet code', async function () {
      const { publicClient, flexSendTimeFacet } = await loadFixture(deployFixture);
  
      const code = await publicClient.getCode({ address: flexSendTimeFacet.address });
      console.log(`FlexSendTimeFacet code: ${code}`);
    });

    it('Should show FlexSendHashFacet code', async function () {
      const { publicClient, flexSendHashFacet } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flexSendHashFacet.address });
      console.log(`FlexSendHashFacet code: ${code}`);
    });

    it('Should show FlexSendNativeFacet function selectors', async function () {
      const { flexSendNativeFacet } = await loadFixture(deployFixture);

      console.log('FlexSendNativeFacet selectors:');
      for (const abi of flexSendNativeFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexSendNativeFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });
  
    it('Should show FlexSendNativeDomainFacet function selectors', async function () {
      const { flexSendNativeDomainFacet } = await loadFixture(deployFixture);

      console.log('FlexSendNativeDomainFacet selectors:');
      for (const abi of flexSendNativeDomainFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }
  
        const item = getAbiItem({ abi: flexSendNativeDomainFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexSendTimeFacet function selectors', async function () {
      const { flexSendTimeFacet } = await loadFixture(deployFixture);

      console.log('FlexSendTimeFacet selectors:');
      for (const abi of flexSendTimeFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendTimeFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

    it('Should show FlexSendHashFacet function selectors', async function () {
      const { flexSendHashFacet } = await loadFixture(deployFixture);

      console.log('FlexSendHashFacet selectors:');
      for (const abi of flexSendHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  } else {
  //

    it('Should show FlexSendStandalone code', async function () {
      const { publicClient, flex } = await loadFixture(deployFixture);

      const code = await publicClient.getCode({ address: flex.address });
      console.log(`FlexSendStandalone code: ${code}`);
    });

    it('Should show FlexSendStandalone function selectors', async function () {
      const { flexSendHashFacet } = await loadFixture(deployFixture);

      console.log('FlexSendStandalone selectors:');
      for (const abi of flexSendHashFacet.abi) {
        if (abi.type !== 'function') {
          continue;
        }

        const item = getAbiItem({ abi: flexSendHashFacet.abi, name: abi.name });
        const signature = toFunctionSignature(item);
        const selector = toFunctionSelector(item);
        console.log(`- ${selector}: ${signature}`);
      }
    });

  //
  }
  //

  it('Should send native', async function () {
    const {
      flex,
      flexSendNativeFacet,
      flexSendNativeDomainFacet,
      flexSendTimeFacet,
      flexSendHashFacet,
      walletClient,
      resolverClient,
      publicClient,
    } = await loadFixture(deployFixture);

    const start = 123_456;
    const duration = 4_000_000_000n;
    const nonce = 424_242n;
    const group = 0;
    const sender = resolverClient.account.address;
    const receiver = walletClient.account.address;
    const amount = 123_456_789n;

    const sendDomain = await publicClient.readContract({
      abi: flexSendNativeDomainFacet.abi,
      address: flex.address,
      functionName: 'flexSendNativeDomain',
      args: [],
    });
    const sendData0 = flexEncodeSendNativeData0({
      start,
      duration,
      sender,
    });
    const sendData1 = flexEncodeSendNativeData1({
      group,
      nonce,
      receiver,
    });
    const sendData2 = flexEncodeSendNativeData2({
      amount,
    });
    const sendHash = flexCalcSendNativeHash({
      domain: sendDomain,
      data0: sendData0,
      data1: sendData1,
      data2: sendData2,
    });

    const imaginaryComponentHashes: Hex[] = [];
    for (let i = 0; i < IMAGINARY_COMPONENTS; i++) {
      const imaginaryComponentHash = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
      imaginaryComponentHashes.push(imaginaryComponentHash);
    }

    const componentHashes = [sendHash, ...imaginaryComponentHashes];
    const orderTree = flexCalcTree({ leaves: componentHashes });
    const orderHash = flexCalcTreeHash({ tree: orderTree });

    const sendComponentBranch = flexCalcSendNativeBranch({
      tree: orderTree,
      sendNativeHash: sendHash,
    });

    let expectedSendHash: Hex;
    {
      const time = await publicClient.readContract({
        abi: flexSendTimeFacet.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(0);

      expectedSendHash = zeroAddress;

      const hash = await publicClient.readContract({
        abi: flexSendHashFacet.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }

    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const hash = await resolverClient.writeContract({
        abi: flexSendNativeFacet.abi,
        address: flex.address,
        functionName: 'flexSendNative',
        args: [
          sendData0,
          sendData1,
          sendComponentBranch,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNative gas (1st): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(amount);
    }

    {
      const time = await publicClient.readContract({
        abi: flexSendTimeFacet.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start);

      expectedSendHash = flexCalcAccumulatorHash({ hashBefore: expectedSendHash, hashToAdd: orderHash });

      const hash = await publicClient.readContract({
        abi: flexSendHashFacet.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }

    {
      const sendData0 = flexEncodeSendNativeData0({
        start: start - 1, // Note - bad start
        duration,
        sender,
      });
      const sendHash = flexCalcSendNativeHash({
        domain: sendDomain,
        data0: sendData0,
        data1: sendData1,
        data2: sendData2,
      });
  
      const componentHashes = [sendHash, ...imaginaryComponentHashes];
      const orderTree = flexCalcTree({ leaves: componentHashes });

      const sendComponentBranch = flexCalcSendNativeBranch({
        tree: orderTree,
        sendNativeHash: sendHash,
      });

      await expect(
        resolverClient.writeContract({
          abi: flexSendNativeFacet.abi,
          address: flex.address,
          functionName: 'flexSendNative',
          args: [
            sendData0,
            sendData1,
            sendComponentBranch,
          ],
          value: amount,
        }),
      ).rejectedWith(
        'FlexChronologyError()', // Start time less than previous order in group is not allowed
      );
    }

    let newOrderHash: Hex;
    {
      const balanceBefore = await publicClient.getBalance({ address: receiver });

      const sendData0 = flexEncodeSendNativeData0({
        start: start + 1, // Note - new start
        duration,
        sender,
      });
      const sendHash = flexCalcSendNativeHash({
        domain: sendDomain,
        data0: sendData0,
        data1: sendData1,
        data2: sendData2,
      });
  
      const componentHashes = [sendHash, ...imaginaryComponentHashes];
      const orderTree = flexCalcTree({ leaves: componentHashes });
      newOrderHash = flexCalcTreeHash({ tree: orderTree });

      const sendComponentBranch = flexCalcSendNativeBranch({
        tree: orderTree,
        sendNativeHash: sendHash,
      });

      const hash = await resolverClient.writeContract({
        abi: flexSendNativeFacet.abi,
        address: flex.address,
        functionName: 'flexSendNative',
        args: [
          sendData0,
          sendData1,
          sendComponentBranch,
        ],
        value: amount,
      });

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log(`flexSendNative gas (2nd): ${receipt.gasUsed}`);

      const balance = await publicClient.getBalance({ address: receiver });
      expect(balance - balanceBefore).equal(amount);
    }

    {
      const time = await publicClient.readContract({
        abi: flexSendTimeFacet.abi,
        address: flex.address,
        functionName: 'flexSendTime',
        args: [
          sender,
          group,
        ],
      });
      expect(time).equal(start + 1);

      expectedSendHash = flexCalcAccumulatorHash({ hashBefore: expectedSendHash, hashToAdd: newOrderHash });

      const hash = await publicClient.readContract({
        abi: flexSendHashFacet.abi,
        address: flex.address,
        functionName: 'flexSendHash',
        args: [
          sender,
          group,
        ],
      });
      expect(hash).equal(expectedSendHash);
    }
  });
});
