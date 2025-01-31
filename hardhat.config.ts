import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';

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
      'contracts/facets/FlexReceiveNativeDomainFacet.sol',

      'contracts/facets/FlexReceiveStateFacet.sol',
      'contracts/facets/FlexReceiveHashFacet.sol',

      'contracts/facets/FlexConfirmNativeFacet.sol',
      'contracts/facets/FlexConfirmNativeDomainFacet.sol',

      'contracts/facets/FlexSendNativeDomainFacet.sol',
      'contracts/facets/FlexSendNativeFacet.sol',

      'contracts/facets/FlexSendTokenDomainFacet.sol',
      'contracts/facets/FlexSendTokenFacet.sol',

      'contracts/facets/FlexSendTimeFacet.sol',
      'contracts/facets/FlexSendHashFacet.sol',

      'contracts/standalone/FlexReceiveStandalone.sol',
      'contracts/standalone/FlexSendStandalone.sol',
      'contracts/standalone/FlexStandalone.sol',

      'contracts/delegates/FlexReceiveNativeBox.sol',
      'contracts/delegates/FlexReceiveNativeFactory.sol',
    ],
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
