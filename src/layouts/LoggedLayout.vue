<template>
  <q-layout view="hHh LpR fFf">
    <q-header
      reveal
      height-hint="98"
      bordered
      class="bg-primary"
      :class="darkmode ? 'text-offwhite' : 'text-dark'"
    >
      <q-toolbar class="q-pl-none q-pr-none">
        <q-btn stretch flat label="Home" to="/l" />
        <q-separator vertical />
        <q-btn
          v-if="authenticated"
          stretch
          flat
          label="Forum"
          href="https://forum.kurtn3x.xyz"
        />
        <q-separator vertical />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawer"
      side="left"
      overlay
      bordered
      mini
      mini-to-overlay
      :width="200"
      :breakpoint="500"
    >
      <!-- drawer content       @click.capture="drawerClick" -->
    </q-drawer>

    <!-- fix  -->

    <q-drawer
      v-if="authenticated"
      v-model="rightDrawer"
      :mini="miniState"
      :width="200"
      :breakpoint="500"
      bordered
      overlay
      side="right"
      :class="darkmode ? 'bg-dark' : 'bg-orange-3'"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>

            <q-item-section> My Profile </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>

            <q-item-section> Send </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="drafts" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section> Logout </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- http://jsfiddle.net/shomz/yFy5n/5/ -->
      <q-btn
        dense
        round
        unelevated
        :text-color="darkmode ? 'dark' : 'offwhite'"
        :color="darkmode ? 'offwhite' : 'dark'"
        :icon="miniState ? 'chevron_left' : 'chevron_right'"
        @click="miniState = !miniState"
        size="sm"
        v-bind:class="miniState ? 'drawer_btn_desk' : 'drawer_btn_desk_moved'"
        v-if="!mobile"
      />

      <!-- mobile  -->
      <q-btn
        round
        :text-color="darkmode ? 'dark' : 'offwhite'"
        :color="darkmode ? 'offwhite' : 'dark'"
        icon="chevron_right"
        @click="rightDrawer = !rightDrawer"
        size="md"
        class="drawer_btn_mob"
        v-if="mobile"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      elevated
      class="bg-primary"
      :class="darkmode ? 'text-offwhite' : 'text-dark'"
    >
      <div
        v-if="authenticated && mobile"
        class="fixed-right drawer_btn_mob_moved"
      >
        <!-- mobile  -->
        <q-btn
          round
          size="md"
          :text-color="darkmode ? 'dark' : 'offwhite'"
          :color="darkmode ? 'offwhite' : 'dark'"
          icon="chevron_left"
          @click="rightDrawer = !rightDrawer"
        />
      </div>
      <q-toolbar>
        <q-toolbar-title>
          <div>Under developement.</div>
        </q-toolbar-title>
        <q-btn-dropdown icon="settings" flat>
          <q-list>
            <q-item>
              <q-toggle
                v-model="darkmode"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Dark Mode"
                @click="darkmodeChanged"
              />
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { Dark } from 'quasar';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/authenticated.ts';
import router from 'src/router/index.ts';

export default {
  computed: {
    authenticated() {
      return this.store.auth_state;
      //return true;
    },
    mobile() {
      return this.q.platform.is.mobile;
      // return true;
    },
  },
  beforeCreate() {
    if (!this.store.auth_state) {
      const q = useQuasar();
      this.$router.push('/');
      q.notify({
        type: 'info',
        message:
          'You tried accessing a page which requires authorization without being authorized. Redirecting to Start Page.',
        progress: true,
        multiLine: true,
      });
    }
  },
  setup() {
    const store = useAuthStore();
    const miniState = ref(true);
    const q = useQuasar();

    if (q.platform.is.mobile) {
      var rightDrawer = ref(false);
    } else {
      var rightDrawer = ref(true);
    }
    var darkmode = ref(store.darkmode_state);

    return {
      toggleLeftDrawer() {
        leftDrawer.value = !leftDrawer.value;
      },

      // layout & styling
      store,
      q,
      darkmode,
      rightDrawer,
      miniState,
      loading: ref(false),
    };
  },

  methods: {
    darkmodeChanged() {
      this.store.darkmode = this.darkmode;
    },

    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    logout() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .post('/auth/logout', '', config)
        .then((response) => {
          if (response.status == 200) {
            this.store.authenticated = false;
            this.$router.push('/');
          }
        })
        .catch();
    },
  },
};
</script>

<style scoped>
.pw_icon:hover {
  color: whitesmoke;
}

.drawer_btn_desk {
  position: absolute;
  top: 15px;
  right: 46px;
  transition: all 0.1s linear;
}
.drawer_btn_desk_moved {
  position: absolute;
  top: 15px;
  right: 190px;
  transition: all 0.1s linear;
}

.drawer_btn_mob {
  position: fixed;
  top: 45%;
  right: 185px;
  transition: all 0.1s linear;
}
.drawer_btn_mob_moved {
  position: fixed;
  right: -14px;
  top: 45%;
  transition: all 0.1s linear;
}
</style>
