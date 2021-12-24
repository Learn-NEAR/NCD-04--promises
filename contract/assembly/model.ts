import { Context, PersistentVector, logging, env } from "near-sdk-as";

type PromiseId = i32;
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
  id: PromiseId;
  who: AccountId = Context.sender;
  vote_yes: VoteTally = 0;
  vote_no: VoteTally = 0;
  timestamp: Timestamp = Context.blockTimestamp;
  votes: Map<AccountId, Vote> = new Map<AccountId, Vote>();
  canView: Set<AccountId> = new Set<AccountId>();
  canVote: Set<AccountId> = new Set<AccountId>();

  constructor(public what: string, viewers: AccountId[], voters: AccountId[]) {
    for (let i = 0; i < viewers.length; ++i) {
      let viewer = viewers[i];
      assert(env.isValidAccountID(viewer), `Viewer (${viewer}) account is invalid`)

      logging.log('adding viewer: ' + viewer)
      this.canView.add(viewer)
    }

    for (let i = 0; i < voters.length; ++i) {
      let voter = voters[i];
      assert(env.isValidAccountID(voter), `Voter (${voter}) account is invalid`)

      logging.log('adding voter: ' + voter)
      this.canVote.add(voter)

      // all voters are viewers too, otherwise how can they vote?
      logging.log('adding voter to viewers: ' + voter)
      this.canView.add(voter)
    }

    this.id = promises.length
    promises.push(this);
  }
}

/**
 * collections.vector is a persistent collection. Any changes to it will
 * be automatically saved in the storage.
 * The parameter to the constructor needs to be unique across a single contract.
 * It will be used as a prefix to all keys required to store data in the storage.
 */
export const promises = new PersistentVector<Promise>("p");
