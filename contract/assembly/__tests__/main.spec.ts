import { makePromise, getPromises, vote } from '../../assembly';
import { storage, Context, runtime_api, VMContext, logging } from "near-sdk-as";

const someContract = "somecontract.testnet"

const coolio = "coolio.testnet"
const bravio = "bravio.testnet"
const lazio = "lazio.testnet"

describe("Promise", () => {

    beforeEach(() => {
        VMContext.setSigner_account_id(coolio)
        VMContext.setPredecessor_account_id(coolio)
    });

    itThrows("disallow make promise on behalf", () => {
        VMContext.setSigner_account_id(coolio)
        VMContext.setPredecessor_account_id(someContract)
        makePromise("test promise")
    });

    it("should create promise", () => {
        var promise = makePromise("test promise");
        expect(promise.id).toStrictEqual(0)
        expect(getPromises('me').length).toStrictEqual(1);    
        expect(getPromises('').length).toStrictEqual(0);
        expect(getPromises('me')[0].promise.who).toStrictEqual(coolio);
        log("promise created by: " + getPromises('me')[0].promise.who);    
    });

    it("should create two promises by the same creator", () => {
        var promise1 = makePromise("test promise");
        expect(promise1.id).toStrictEqual(0)
        var promise2 = makePromise("test promise 2");
        expect(promise2.id).toStrictEqual(1)
        expect(getPromises('me').length).toStrictEqual(2);    
        expect(getPromises('').length).toStrictEqual(0);
        log("total promises created: " + "by " + coolio + ": " + getPromises('me').length.toString());
        log("total promises created: " + "by others " + ": " + getPromises('').length.toString());
    });

    it("should create two promises by different creators", () => {
        VMContext.setSigner_account_id(coolio)
        VMContext.setPredecessor_account_id(coolio)

        var promise1 = makePromise("coolio's promise");
        expect(promise1.promise.who).toStrictEqual(coolio);
        expect(getPromises('me').length).toStrictEqual(1);    
        expect(getPromises('').length).toStrictEqual(0);    

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        var promise2 = makePromise("bravio's promise");
        expect(promise2.promise.who).toStrictEqual(bravio);
        expect(getPromises('me').length).toStrictEqual(1);    
        expect(getPromises('').length).toStrictEqual(1);    

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        expect(getPromises('me').length).toStrictEqual(0);    
        expect(getPromises('').length).toStrictEqual(2);    
    });

    itThrows("should disallow to vote for own promise", () => {
        VMContext.setSigner_account_id(coolio)
        VMContext.setPredecessor_account_id(coolio)

        var promise1 = makePromise("coolio's promise");
        vote(promise1.id, true);
    });

    it("should allow to vote for other's promise", () => {
        VMContext.setSigner_account_id(coolio)
        VMContext.setPredecessor_account_id(coolio)

        var promise1 = makePromise("coolio's promise");

        VMContext.setSigner_account_id(bravio)
        VMContext.setPredecessor_account_id(bravio)

        promise1 = vote(promise1.id, true);
        expect(promise1.promise.vote_yes).toStrictEqual(1);
        expect(promise1.promise.vote_no).toStrictEqual(0);

        promise1 = vote(promise1.id, true);
        expect(promise1.promise.vote_yes).toStrictEqual(1);
        expect(promise1.promise.vote_no).toStrictEqual(0);

        promise1 = vote(promise1.id, false);
        expect(promise1.promise.vote_yes).toStrictEqual(0);
        expect(promise1.promise.vote_no).toStrictEqual(1);

        VMContext.setSigner_account_id(lazio)
        VMContext.setPredecessor_account_id(lazio)

        promise1 = vote(promise1.id, false);
        expect(promise1.promise.vote_yes).toStrictEqual(0);
        expect(promise1.promise.vote_no).toStrictEqual(2);

        promise1 = vote(promise1.id, false);
        expect(promise1.promise.vote_yes).toStrictEqual(0);
        expect(promise1.promise.vote_no).toStrictEqual(2);
    });
});
