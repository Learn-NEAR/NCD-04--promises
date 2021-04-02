/*
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/roles/developer/contracts/assemblyscript
 *
 */

import { Context, logging, PersistentMap, PersistentVector, storage } from 'near-sdk-as'
import { Promise, ReturnedPromise, Vote, promises } from './model';

/**
 * Returns an array of last N promises.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
 export function getPromises(target: string): ReturnedPromise[] {
  assert(Context.predecessor == Context.sender)

  const result = new Array<ReturnedPromise>()
  const forMe = (target == 'me')
  // logging.log('getPromises: sender = ' + Context.sender + ', target = ' + target + ', forMe = ' + forMe.toString())

  for(let i = 0; i < promises.length; ++i) {
    // logging.log('getPromises: promise = ' + promises[i].who + ', promises[i].who === Context.sender = ' + (promises[i].who == Context.sender).toString())

    if(promises[i].who == Context.sender) {
      if(forMe == true)
        result.push(new ReturnedPromise(i, promises[i]))
    } else {
      if(forMe == false)
        result.push(new ReturnedPromise(i, promises[i]))
    }
  }
  return result;
 }

export function vote(promiseId: i32, value: boolean) : ReturnedPromise {
  assert(Context.predecessor == Context.sender)
  assert(promiseId >= 0 && promiseId < promises.length)

  logging.log('vote: sender = ' + Context.sender + ', promiseId = ' + promiseId.toString() + ', value = ' + value.toString() + ', total promises = ' + promises.length.toString())
  let promise = promises[promiseId];
  assert(promise.who != Context.sender)

  let newVote = value == true ? Vote.Yes : Vote.No
  if(promise.votes.has(Context.predecessor)) {
    logging.log('vote: re-vote...')

    let voteValue = promise.votes.get(Context.predecessor);
    logging.log('voteValue = ' + voteValue.toString())

    if(newVote != voteValue) {
      logging.log('value != voteValue')

      promise.votes.set(Context.predecessor, newVote);
      if(voteValue == Vote.Yes) {
        logging.log('re-vote to no')

        promise.vote_yes -= 1
        promise.vote_no += 1 
      } else {
        logging.log('re-vote to yes')

        promise.vote_yes += 1
        promise.vote_no -= 1
      }
    } 
    else 
    {
      logging.log('value = voteValue = ' + value.toString())
    }
  } else {
    logging.log('vote: new vote...')

    promise.votes.set(Context.predecessor, newVote);
    if(value == true) {
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

export function makePromise(what: string) : ReturnedPromise {
  assert(Context.predecessor == Context.sender)

  promises.push(new Promise(what));
  return new ReturnedPromise(promises.length - 1, promises[promises.length - 1])
}

// debug only 
export function clearAll(): void {
  assert(Context.predecessor == Context.sender)

  while(promises.length !== 0)
    promises.pop();
}