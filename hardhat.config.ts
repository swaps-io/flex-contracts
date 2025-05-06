import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1_000_000,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: true,
    runOnCompile: true,
    strict: true,
    only: [
      'contracts/facets/FlexReceiveNativeFacet.sol',
      'contracts/facets/views/domains/FlexReceiveNativeDomainFacet.sol',

      'contracts/facets/FlexReceiveTokenFacet.sol',
      'contracts/facets/views/domains/FlexReceiveTokenDomainFacet.sol',

      'contracts/facets/FlexReceiveTokenFromFacet.sol',
      'contracts/facets/views/domains/FlexReceiveTokenFromDomainFacet.sol',

      'contracts/facets/views/FlexReceiveStateFacet.sol',
      'contracts/facets/views/FlexReceiveHashFacet.sol',

      'contracts/facets/FlexSettleNativeFacet.sol',
      'contracts/facets/views/domains/FlexSettleNativeDomainFacet.sol',

      'contracts/facets/FlexSettleNativeProofFacet.sol',
      'contracts/facets/views/domains/FlexSettleNativeProofDomainFacet.sol',

      'contracts/facets/FlexSettleTokenFacet.sol',
      'contracts/facets/views/domains/FlexSettleTokenDomainFacet.sol',

      'contracts/facets/FlexSettleTokenProofFacet.sol',
      'contracts/facets/views/domains/FlexSettleTokenProofDomainFacet.sol',

      'contracts/facets/FlexSendNativeFacet.sol',
      'contracts/facets/views/domains/FlexSendNativeDomainFacet.sol',

      'contracts/facets/FlexSendTokenFacet.sol',
      'contracts/facets/views/domains/FlexSendTokenDomainFacet.sol',

      'contracts/facets/FlexSendNativeFloatFacet.sol',
      'contracts/facets/views/domains/FlexSendNativeFloatDomainFacet.sol',

      'contracts/facets/FlexSendTokenFloatFacet.sol',
      'contracts/facets/views/domains/FlexSendTokenFloatDomainFacet.sol',

      'contracts/facets/views/FlexSendStateFacet.sol',
      'contracts/facets/views/FlexSendHashFacet.sol',

      'contracts/facets/FlexAllocateReceiveFacet.sol',
      'contracts/facets/FlexAllocateSendFacet.sol',

      'contracts/facets/views/FlexProofVerifierFacet.sol',

      'contracts/standalone/FlexStandalone.sol',
    ],
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
