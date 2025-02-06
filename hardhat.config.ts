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

      'contracts/facets/FlexConfirmNativeFacet.sol',
      'contracts/facets/views/domains/FlexConfirmNativeDomainFacet.sol',

      'contracts/facets/FlexConfirmTokenFacet.sol',
      'contracts/facets/views/domains/FlexConfirmTokenDomainFacet.sol',

      'contracts/facets/FlexRefundNativeFacet.sol',
      'contracts/facets/views/domains/FlexRefundNativeDomainFacet.sol',

      'contracts/facets/FlexRefundTokenFacet.sol',
      'contracts/facets/views/domains/FlexRefundTokenDomainFacet.sol',

      'contracts/facets/FlexSendNativeFacet.sol',
      'contracts/facets/views/domains/FlexSendNativeDomainFacet.sol',

      'contracts/facets/FlexSendTokenFacet.sol',
      'contracts/facets/views/domains/FlexSendTokenDomainFacet.sol',

      'contracts/facets/views/FlexSendTimeFacet.sol',
      'contracts/facets/views/FlexSendHashFacet.sol',

      'contracts/facets/FlexAllocateReceiveFacet.sol',

      'contracts/standalone/receive/FlexReceiveNativeStandalone.sol',
      'contracts/standalone/receive/FlexReceiveTokenStandalone.sol',
      'contracts/standalone/receive/FlexReceiveStandalone.sol',
      'contracts/standalone/send/FlexSendNativeStandalone.sol',
      'contracts/standalone/send/FlexSendTokenStandalone.sol',
      'contracts/standalone/send/FlexSendStandalone.sol',
      'contracts/standalone/FlexStandalone.sol',
    ],
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
