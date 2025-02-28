import { Hex } from '../external';

import { flexEncodeSendBucketState, FlexEncodeSendBucketStateParams } from '../send';

import { FLEX_ALLOCATED_HASH, FLEX_UNALLOCATED_HASH } from '../constants';

export interface FlexEncodeSendFailBaseState {
  state: 'unallocated' | 'allocated' | FlexEncodeSendBucketStateParams;
}

export function flexEncodeSendFailBaseState(params: FlexEncodeSendFailBaseState): Hex {
  switch (params.state) {
    case 'unallocated':
      return flexEncodeSendBucketState({ hash: FLEX_UNALLOCATED_HASH, time: 0 });
    case 'allocated':
      return flexEncodeSendBucketState({ hash: FLEX_ALLOCATED_HASH, time: 0 });
    default:
      return flexEncodeSendBucketState(params.state);
  }
};
