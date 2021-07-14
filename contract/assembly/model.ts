import { Context, PersistentVector } from "near-sdk-as";

type AccountId = string;
type VoteTally = u64;
type Timestamp = u64;

export enum Vote {
  No,
  Yes
}

/**
 * Exporting a new class Promise so it can be used outside of this file.
 */
@nearBindgen
export class Promise {
  who: AccountId = Context.sender;
  vote_yes: VoteTally = 0;
  vote_no: VoteTally = 0;
  timestamp: Timestamp = Context.blockTimestamp;
  votes: Map<AccountId, Vote> = new Map<AccountId, Vote>();
  canView: Set<AccountId> = new Set<AccountId>();
  canVote: Set<AccountId> = new Set<AccountId>();

  constructor(public what: string) { }
}

@nearBindgen
export class ReturnedPromise {
  constructor(public id: i32, public promise: Promise) {
  }
}

/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const promises = new PersistentVector<Promise>("p");
