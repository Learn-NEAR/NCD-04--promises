<template>
  <div>
    <button class="link" style="float: right" v-on:click="logout">
      Sign out
    </button>
    <main>
      <h1>
        <label
          for="greeting"
          style="
            color: var(--secondary);
            border-bottom: 2px solid var(--secondary);
          "
        ></label>
        {{ accountId }}
      </h1>
      <!--
      <form v-on:submit.prevent="saveGreeting">
        <fieldset ref="fieldset">
          <label
            for="greeting"
            style="display: block; color: var(--gray); margin-bottom: 0.5em"
          >Change greeting</label
          >
          <div style="display: flex">
            <input
              v-model="newGreeting"
              autocomplete="off"
              id="greeting"
              style="flex: 1"
            />
            <button id="save" style="border-radius: 0 5px 5px 0">Save</button>
          </div>
        </fieldset>
      </form>
      -->

      <v-container class="grey lighten-5">
        <v-row>
          <v-col>
            <p>I promise</p>
            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">What</th>
                    <th class="text-left">When</th>
                    <th class="text-left">Yes votes</th>
                    <th class="text-left">No votes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in my_promises" :key="item.name">
                    <td>{{ item.what }}</td>
                    <td>{{ item.when }}</td>
                    <td>{{ item.vote_yes }}</td>
                    <td>{{ item.vote_no }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
            <template>
              <div class="text-center">
                <v-dialog
                  v-model="dialog"
                  width="500"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="red lighten-2"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                      Add promise
                    </v-btn>
                  </template>

                  <v-card>
                    <v-toolbar color="primary" dark>My new promise</v-toolbar>
                    <v-card-text>
                      <v-text-field 
                        placeholder="I promise.." 
                        v-model="promise"
                      >
                      </v-text-field>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="primary"
                        text
                        @click="addPromise(promise)"
                      >
                        Yes, I do!
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </template>
          </v-col>

          <v-col>
            <p>People promise</p>
            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Who</th>
                    <th class="text-left">What</th>
                    <th class="text-left">When</th>
                    <th class="text-left">Yes votes</th>
                    <th class="text-left">No votes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in others_promises" :key="item.name">
                    <td>{{ item.who }}</td>
                    <td>{{ item.what }}</td>
                    <td>{{ item.when }}</td>
                    <td>{{ item.vote_yes }}</td>
                    <td>{{ item.vote_no }}</td>
                    <td>
                      <v-btn :disabled="item.votes.hasOwnProperty(accountId) && (item.votes[accountId] == 1)" dark small color="green" @click="voteYes(item)"/>
                      <v-btn :disabled="item.votes.hasOwnProperty(accountId) && (item.votes[accountId] == 0)" dark small color="red" @click="voteNo(item)"/>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>

        </v-row>  
      </v-container>
    </main>

    <Notification
      v-show="notificationVisible"
      ref="notification"
      :networkId="networkId"
      :msg="'calling method: ' + method"
      :contractId="contractId"
      :visible="false"
    />
  </div>
</template>

<script>
import { logout } from "../utils";
import Notification from "./Notification.vue";

export default {
  name: "SignedIn",

  beforeMount() {
    if (this.isSignedIn) {

      this.infiniteUpdate = () => {
        this.updatePromises(false).then(() => {
          return this.delay(10);
        }).then(this.infiniteUpdate)
      }

      this.fetchPromises().then(this.infiniteUpdate)
    }
  },

  components: {
    Notification,
  },

  data: function () {
    return {
      method: "",
      notificationVisible: false,
      dialog: false,
      promise: "",
      my_promises: [
      ],
      others_promises: [
      ],
    };
  },

  computed: {
    isSignedIn() {
      return window.walletConnection
        ? window.walletConnection.isSignedIn()
        : false;
    },
    accountId() {
      return window.accountId;
    },
    contractId() {
      return window.contract ? window.contract.contractId : null;
    },
    networkId() {
      return window.networkId;
    },
  },

  methods: {
    delay: function(milliseconds) {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve(milliseconds);
          }, milliseconds);
      })
    },

    addPromise: function(promise) {
      this.method = "addPromise"
      this.notificationVisible = true

      console.log('promise: ', promise)
      window.contract
      .makePromise({ accountId: window.accountId, what: promise })
      .then((addedPromise) => {
        console.log('promise added: ', addedPromise)
        const promiseItem = Object.assign(addedPromise.promise, {id: addedPromise.id})

        console.log('promiseItem: ', promiseItem)
        this.my_promises.push(promiseItem)
        this.notificationVisible = false
      }).catch(() => {
        this.notificationVisible = false
      });

      this.promise = ""
      this.dialog = false
    },

    updatePromise: function(updatedPromise, promisesList, updateCondition) {
      for(let i = 0; i < promisesList.length; ++i) {
          let otherPromise = promisesList[i];
          if(otherPromise.id == updatedPromise.id) {
            if((updateCondition ? updateCondition(otherPromise, updatedPromise.promise) == true: true)) {
              console.log('updated promise')
              const promiseItem = Object.assign(updatedPromise.promise, {id: updatedPromise.id})
              promisesList.splice(i, 1, promiseItem)
            }
            return true
          }
        }

      return false
    },

    voteYes: function(promise) {
      this.method = "vote(yes)"
      this.notificationVisible = true
      console.log('vote yes for promise: ', JSON.stringify(promise))
      window.contract
      .vote({accountId: window.accountId, promiseId: promise.id, value: true})
      .then((updatedPromise) => {
        this.updatePromise(updatedPromise, this.others_promises);
        this.notificationVisible = false
      }).catch(() => {
        this.notificationVisible = false        
      });
    },

    voteNo: function(promise) {
      this.method = "vote(no)"
      this.notificationVisible = true
      console.log('vote no for promise: ', JSON.stringify(promise))
      window.contract
      .vote({accountId: window.accountId, promiseId: promise.id, value: false})
      .then((updatedPromise) => {
        this.updatePromise(updatedPromise, this.others_promises);
        this.notificationVisible = false
      }).catch(() => {
        this.notificationVisible = false        
      });
    },

    fetchPromises: function() {
      console.debug('fetching promises for: ' + window.accountId)

      this.method = "getPromises"
      this.notificationVisible = true

      var getMyPromises = window.contract
        .getPromises({ accountId: window.accountId, target: 'me' })
        .then((promises) => {
          console.debug('fetched my promises: ', promises.length);
          promises.forEach(promise => {
            const promiseItem = Object.assign(promise.promise, {id: promise.id})
            
            // console.debug('promiseItem: ', promiseItem);
            this.my_promises.push(promiseItem)
          });
        })
        .catch((err) => {
          console.error(err);  
        })

      var getOthersPromises = window.contract
        .getPromises({ accountId: window.accountId, target: 'others' })
        .then((promises) => {
          console.debug('fetched others promises: ', promises.length);
          promises.forEach(promise => {
            const promiseItem = Object.assign(promise.promise, {id: promise.id})

            // console.debug('promiseItem: ', promiseItem);
            this.others_promises.push(promiseItem)
          });
        })
        .catch((err) => {
          console.error(err);  
        });

      return Promise.all([getMyPromises, getOthersPromises]).then(() => {
        this.notificationVisible = true
      }).catch(() => {
        this.notificationVisible = false
      });
     },

    updatePromises: function() { 
      var updateCondition = (other, current) => {
          var needUpdate = other.vote_no != current.vote_no || other.vote_yes != current.vote_yes
          return needUpdate
      };

      var updateOthersPromises =  window.contract
        .getPromises({ accountId: window.accountId, target: 'others' })
        .then((promises) => {
          console.debug('fetched others promises: ', promises.length);
          promises.forEach(returnedPromise => {
            const promiseId = returnedPromise.id;
            const promise = returnedPromise.promise

            if(this.updatePromise(returnedPromise, this.others_promises, updateCondition) == false) { 
              const promiseItem = Object.assign(promise, {id: promiseId})
              this.others_promises.push(promiseItem)
            }
          });
        })
        .catch((err) => {
          console.error(err);  
        });

      var updateMyPromises =  window.contract
        .getPromises({ accountId: window.accountId, target: 'me' })
        .then((promises) => {
          console.debug('fetched my promises: ', promises.length);
          promises.forEach(returnedPromise => {
            this.updatePromise(returnedPromise, this.my_promises, updateCondition);
          });
        })
        .catch((err) => {
          console.error(err);  
        });

      return Promise.all([updateMyPromises, updateOthersPromises]);
    },

    logout: logout,
  },
};
</script>
