import Vue from "vue"
import App from "./App.vue"

import { initContract } from "./utils"
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

window.nearInitPromise = initContract()
  .then(() => {

    new Vue({
      vuetify,
      render: h => h(App)
    }).$mount("#app")

  })
  