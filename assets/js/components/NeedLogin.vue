<template>
  <div>
    <modal ref="refModal" class="text-center" @click.stop="">
      <h3>Login</h3>
      <div class="alert alert-danger" v-show="error">{{ error }}</div>
      <div class="form-group">
        <input type="text" class="form-control" placeholder="Username" v-model="username">
      </div>
      <div class="form-group">
        <input type="password" class="form-control" placeholder="Password" v-model="password">
      </div>
      <button class="btn btn-primary" @click="login()" :disabled="!username || !password">Login</button>
    </modal>

    <modal ref="refRegistrationModal" class="text-center" @click.stop="">
      <h3>Registration</h3>
      <p>
        No records found. Maybe, you entered wrong username or password.
        Click 'No' to try to log in again.
        Click 'Yes', if you want to create a new profile.
      </p>
      <button class="btn btn-primary my-1" type="button" @click="$refs.refRegistrationModal.hide()">
        No, I want to enter username and password again.
      </button>
      <button class="btn btn-success my-1" type="button" @click="proceed()">
        Yes, sign me up, please.
      </button>
    </modal>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        username: "",
        password: "",
        error: "",
      };
    },
    methods: {
      proceed() {
        this.$auth.save();
        window.location.reload();
      },

      login() {
        var checkResult = this.$auth.checkPassword(this.password);
        if (checkResult.success) {
          this.error = "";
          this.$auth.login(this.username, this.password);
          this.$api.init(this.$auth);
          this.$api.list(items => {
            if (items.length > 0) {
              this.proceed();
            } else {
              this.$refs.refRegistrationModal.show();
            }
          });
        }
        else {
          this.error = checkResult.error;
          this.$forceUpdate();
        }
      },

      checkPassword(password) {
        if (password.length < 12) {
          this.error = "Password must contain at least 12 symbols.";
          return false;
        }
        if (!(password.match(/[a-z]/))) {
          this.error = "Password does not contain lowercase symbols.";
          return false;
        }
        if (!(password.match(/[A-Z]/))) {
          this.error = "Password does not contain uppercase symbols.";
          return false;
        }
        if (!(password.match(/[0-9]/))) {
          this.error = "Password does not contain digits symbols.";
          return false;
        }
        if (!(password.match(/^[a-zA-Z0-9]{12,}$/))) {
          this.error = "Allow symbols are: uppercase and lowercase latin letters, digits.";
          return false;
        }
        return true;
      }
    },
    mounted() {
      if (!this.$auth.isAuthenticated()) {
        this.$refs.refModal.show();
      }
      else if (!this.$auth.checkKeys()) {
        this.$auth.logout();
        window.location.reload();
      }
    },
  }
</script>
