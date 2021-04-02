<template>
  <main>
    <h1>Welcome to promises tracker!</h1>
    <p style="text-align:center; margin-top:2.5em">
      <button v-on:click="login">Sign in</button>
    </p>
  </main>
</template>

<script>
import { login } from "../utils"

export default {
  name: "SignedOut",

  methods: {
    login() {
      console.log("calling utils.login")
      login()
    },
  },
}
</script>
