import { Context, PersistentMap, PersistentVector } from "near-sdk-as";

export enum Vote {
    No,
    Yes
}

/** 
 * Exporting a new class Promise so it can be used outside of this file.
 */
@nearBindgen
export class Promise {
  who: string;
  vote_yes: u64 = 0;
  vote_no: u64 = 0;
  timestamp: u64 = 0;
  votes: Map<string, Vote> = new Map<string, Vote>();
  canView: Set<string> = new Set<string>();
  canVote: Set<string> = new Set<string>();

  constructor(public what: string) {
    this.who = Context.sender;
    this.timestamp = Context.blockTimestamp;
  }
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
