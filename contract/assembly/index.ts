/*
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */

import { Context, env, logging } from 'near-sdk-as'
import { Promise, ReturnedPromise, Vote, promises } from './model';

/**
 * Returns an array of last N promises.\
 * NOTE: This is a NOT a view method at the moment. Which means it costs money so shouldn't be executed too frequently.
 */
export function getPromises(target: string): ReturnedPromise[] {
  assertDirectCall()

  const result = new Array<ReturnedPromise>()
  const forMe = (target == 'me')
  // logging.log('getPromises: sender = ' + Context.sender + ', target = ' + target + ', forMe = ' + forMe.toString())

  for (let i = 0; i < promises.length; ++i) {
    // logging.log('getPromises: promise = ' + promises[i].who + ', promises[i].who === Context.sender = ' + (promises[i].who == Context.sender).toString())

    let promise = promises[i]
    if (forMe == true) {
      if (promise.who == Context.sender)
        result.push(new ReturnedPromise(i, promise))
    } else {
      const isPublicNotMinePromise = promise.canView.size == 0 && promise.who != Context.sender
      const canViewPromise = (isPublicNotMinePromise ? true : promise.canView.has(Context.sender))

      if (canViewPromise)
        result.push(new ReturnedPromise(i, promise))
    }
  }
  return result;
}

export function vote(promiseId: i32, value: boolean): ReturnedPromise {
  assertDirectCall()
  assert(promiseId >= 0 && promiseId < promises.length)

  logging.log('vote: sender = ' + Context.sender + ', promiseId = ' + promiseId.toString() + ', value = ' + value.toString() + ', total promises = ' + promises.length.toString())
  let promise = promises[promiseId];

  let isPublicPromise = promise.canVote.size == 0
  let isAllowedToVote = isPublicPromise ? (promise.who != Context.sender) : promise.canVote.has(Context.sender)
  assert(isAllowedToVote)

  let newVote = value == true ? Vote.Yes : Vote.No
  if (promise.votes.has(Context.predecessor)) {
    logging.log('vote: re-vote...')

    let voteValue = promise.votes.get(Context.predecessor);
    logging.log('voteValue = ' + voteValue.toString())

    if (newVote != voteValue) {
      logging.log('value != voteValue')

      promise.votes.set(Context.predecessor, newVote);
      if (voteValue == Vote.Yes) {
        logging.log('re-vote to no')

        promise.vote_yes -= 1
        promise.vote_no += 1
      } else {
        logging.log('re-vote to yes')

        promise.vote_yes += 1
        promise.vote_no -= 1
      }
    }
    else {
      logging.log('value = voteValue = ' + value.toString())
    }
  } else {
    logging.log('vote: new vote...')

    promise.votes.set(Context.predecessor, newVote);
    if (value == true) {
      logging.log('vote to yes')
      promise.vote_yes += 1
    } else {
      logging.log('vote to no')
      promise.vote_no += 1
    }
  }

  logging.log('vote: replacing promiseId ' + promiseId.toString() + ' with promise = '
    + promise.vote_yes.toString() + "/" + promise.vote_no.toString())

  promises.replace(promiseId, promise);
  return new ReturnedPromise(promiseId, promises[promiseId])
}

export function makePromise(what: string, viewers: string[] = [], voters: string[] = []): ReturnedPromise {
  assertDirectCall()

  const promise = new Promise(what)
  for (let i = 0; i < viewers.length; ++i) {
    let viewer = viewers[i];
    assert(env.isValidAccountID(viewer), "viewer account is invalid")

    logging.log('adding viewer: ' + viewer)
    promise.canView.add(viewer)
  }

  for (let i = 0; i < voters.length; ++i) {
    let voter = voters[i];
    assert(env.isValidAccountID(voter), "voter account is invalid")

    logging.log('adding voter: ' + voter)
    promise.canVote.add(voter)

    // all voters are viewers too, otherwise how can they vote?
    logging.log('adding voter to viewers: ' + voter)
    promise.canView.add(voter)
  }

  promises.push(promise);
  return new ReturnedPromise(promises.length - 1, promises[promises.length - 1])
}

// debug only
export function clearAll(): void {
  assertDirectCall()

  while (promises.length !== 0)
    promises.pop();
}

function assertDirectCall(): void {
  const message = "This method must be called directly.  No cross-contract calls allowed"
  assert(Context.predecessor == Context.sender, message)
}
