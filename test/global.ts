import { expect } from 'chai';

import { flexInit, flexReady } from '@swaps-io/flex-sdk';

before(async function() {
  await flexInit; // CJS target init hassle
  expect(flexReady()).equal(true); // Ensure deps ok
});
