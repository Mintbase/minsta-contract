import {
  LookupMap,
  NearBindgen,
  NearPromise,
  call,
  view,
  near,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

interface Metadata {
  title: string | null;
  description: string | null;
  media: any | null;
  media_hash: string | null;
  copies: number | null;
  expires_at: number | null;
  starts_at: number | null;
  extra: any | null;
  reference: string | null;
  reference_hash: string | null;
}

@NearBindgen({ requireInit: false })
class MinstaProxyMinter {
  constructor() {}

  @call({ payableFunction: true })
  mint({
    metadata,
    nft_contract_id,
  }: {
    metadata: string;
    nft_contract_id: AccountId;
  }) {
    const minter_id = near.predecessorAccountId(); // TODO: near.signerAccountId();

    try {
      const parsed_metadata: Metadata = JSON.parse(metadata);

      const promise = NearPromise.new(nft_contract_id)
        .functionCall(
          "nft_batch_mint",
          JSON.stringify({
            owner_id: minter_id,
            metadata: parsed_metadata,
            num_to_mint: 1,
            royalty_args: {
              split_between: {
                [minter_id]: 10000,
              },
              percentage: 1000,
            },
            split_owners: null,
          }),
          near.attachedDeposit(),
          BigInt("100000000000000")
        )
        .then(
          NearPromise.new(near.currentAccountId()).functionCall(
            "cb_mint",
            JSON.stringify({}),
            BigInt("0"),
            BigInt("50000000000000")
          )
        );

      return promise.asReturn();
    } catch (error) {
      return false;
    }
  }

  @call({ privateFunction: true })
  cb_mint() {
    if (near.promiseResultsCount() == BigInt(1)) {
      return true;
    } else {
      return false;
    }
  }
}
