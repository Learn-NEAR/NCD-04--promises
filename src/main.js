import Vue from "vue"
import App from "./App.vue"

import { initContract } from "./utils"
import vuetify from './plugins/vuetify';
import moment from 'moment'

Vue.config.productionTip = false
Vue.prototype.moment = moment

window.nearInitPromise = initContract()
  .then(() => {

    new Vue({
      vuetify,
      render: h => h(App)
    }).$mount("#app")

  })
  