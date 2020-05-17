<template>
  <modal ref="refModal">
    <h3>About Qnote</h3>
    <p style="white-space: pre-wrap;">Qnote allows to save text notes in a cloud securely. The main difference to analogues is the thoughtful encryption system, based on elliptic curves, that ensures data privacy even from the owner of the cloud server where the data is stored. The idea is that the application keeps private keys on the client side only and does not send them anywhere, so the server obtains the encrypted information with a digital signature (for the ownership rights). Thus this solution is relevant to those who do not trust the cloud's owner and want to prevent any potential data disclosure, but who want to have all the advantages of the cloud storage. Qnote is quite minimalistic, the source code is available on Github openly, so everybody can learn how it works and make sure why it is reliably.

Qnote is a client side application that interacts by API with the service Hash Storage that keeps the encrypted data with its signatures. Generally Hash Storage is an independent solution to store encrypted data. It can be used by other similar applications as well (even together in the same database), so this is not a part of Qnote.

Links to the source code:
Qnote: <a href="https://github.com/fomalhaut88/qnote" target="blank">https://github.com/fomalhaut88/qnote</a>
Hash Storage: <a href="https://github.com/fomalhaut88/hash-storage" target="blank">https://github.com/fomalhaut88/hash-storage</a>

Copyright: Alexander Khlebushchev
<a href="https://fomalhaut.su/" target="blank">https://fomalhaut.su/</a>
    </p>
    <button class="btn btn-primary" @click="hide()">OK</button>
  </modal>
</template>

<script>
  export default {
    methods: {
      show() {
        this.$refs.refModal.show();
      },

      hide() {
        this.$refs.refModal.hide();
      },
    },
  }
</script>
