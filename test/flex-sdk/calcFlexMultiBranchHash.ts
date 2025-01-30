import { expect } from 'chai';

import { calcFlexMultiBranchHash } from '../../@swaps-io/flex-sdk';

describe('flex-sdk/calcFlexMultiBranchHash', function () {
  it('Should calc hash of multi branch of 2 leaves of tree with 2 leaves', function () {
    const hash = calcFlexMultiBranchHash({
      multiBranch: {
        leaves: [
          '0x2222222222222222222222222222222222222222222222222222222222222222',
          '0x1111111111111111111111111111111111111111111111111111111111111111',
        ],
        branch: [],
        flags: [
          true,
        ],
      },
    });
    expect(hash).equal('0x3e92e0db88d6afea9edc4eedf62fffa4d92bcdfc310dccbe943747fe8302e871');
  });

  it('Should calc hash of multi branch of 2 leaves of tree with 7 leaves', function () {
    const hash = calcFlexMultiBranchHash({
      multiBranch: {
        leaves: [
          '0x1111111111111111111111111111111111111111111111111111111111111111',
          '0x3333333333333333333333333333333333333333333333333333333333333333',
        ],
        branch: [
          '0x2222222222222222222222222222222222222222222222222222222222222222',
          '0x37df8a86dbd0a06a5a6720079d9a4ce5a5a5c93198607ca71402d78b7db2869e',
          '0x60c25b70d66af589f985b3cf4732585b8f7ecea5df88cb12368650edfe7e6f50',
        ],
        flags: [
          false,
          false,
          true,
          false,
        ],
      },
    });
    expect(hash).equal('0x7b1966465d8213bb83cb86c06f3301e4b8d4177cbd482843cef3ae92f7576f9d');
  });

  it('Should calc hash of multi branch of 3 leaves of tree with 7 leaves', function () {
    const hash = calcFlexMultiBranchHash({
      multiBranch: {
        leaves: [
          '0x1111111111111111111111111111111111111111111111111111111111111111',
          '0x3333333333333333333333333333333333333333333333333333333333333333',
          '0x5555555555555555555555555555555555555555555555555555555555555555',
        ],
        branch: [
          '0x2222222222222222222222222222222222222222222222222222222222222222',
          '0x37df8a86dbd0a06a5a6720079d9a4ce5a5a5c93198607ca71402d78b7db2869e',
          '0x4444444444444444444444444444444444444444444444444444444444444444',
        ],
        flags: [
          false,
          false,
          false,
          true,
          true,
        ],
      },
    });
    expect(hash).equal('0x7b1966465d8213bb83cb86c06f3301e4b8d4177cbd482843cef3ae92f7576f9d');
  });
});
