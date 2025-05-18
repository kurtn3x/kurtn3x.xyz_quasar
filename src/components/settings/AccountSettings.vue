<template>
  <q-dialog v-model="confirmDeleteAccountDialog">
    <DeleteAccountDialog />
  </q-dialog>
  <div
    :class="darkmode ? 'text-white' : 'text-dark'"
    style="background: transparent"
  >
    <q-card
      flat
      class="no-shadow q-ma-md bg-transparent"
    >
      <div class="text-h4 text-center q-mt-lg">Account Settings</div>

      <q-card-section class="full-width text-body1">
        <!-- Account information display -->
        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Id:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ accountData.id }}
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Username:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ accountData.username }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Email:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ accountData.email }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Is Admin:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ accountData.isAdmin }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Joined:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ profileData.dateJoined }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Name:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ profileData.name }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Location:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ profileData.location }}
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section
            side
            style="width: 100px"
          >
            Status:
          </q-item-section>
          <q-item-section style="line-break: anywhere">
            {{ profileData.status }}
          </q-item-section>
        </q-item>

        <q-separator />
      </q-card-section>

      <q-card-actions class="justify-center">
        <q-list
          bordered
          class="full-width"
          style="max-width: 750px"
        >
          <q-expansion-item
            class="full-width text-center"
            label="Change E-Mail"
            header-style="fontSize: 1.6em"
            group="expansions"
          >
            <q-separator />

            <q-form
              class="q-ma-md q-mt-lg"
              @submit.prevent="handleUpdateEmail"
            >
              <!-- Email change form -->
              <div class="row justify-center">
                <q-input
                  v-model="updateEmailData.newEmail"
                  class="full-width"
                  style="max-width: 400px"
                  label="New Email"
                  input-class="text-body1"
                  outlined
                  type="email"
                  no-error-icon
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 3) || 'At least 4 characters',
                    (val) =>
                      /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                        val
                      ) || 'Not a valid E-Mail',
                  ]"
                  :color="darkmode ? 'white' : 'black'"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              <div class="row justify-center">
                <q-input
                  v-model="updateEmailData.password"
                  class="q-mt-sm full-width"
                  style="max-width: 400px"
                  label="Current Password"
                  input-class="text-body1"
                  outlined
                  :type="isPwd2 ? 'password' : 'text'"
                  :color="darkmode ? 'white' : 'black'"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd2 ? 'visibility' : 'visibility_off'"
                      @click="isPwd2 = !isPwd2"
                    />
                  </template>
                </q-input>
              </div>
              <q-btn
                class="full-width q-mb-md q-mt-lg"
                style="max-width: 350px"
                label="Change E-Mail"
                size="lg"
                color="green"
                push
                type="submit"
                :loading="loading"
              />
            </q-form>
          </q-expansion-item>
          <q-separator />

          <q-expansion-item
            class="full-width text-center"
            label="Change Password"
            header-style="fontSize: 1.6em"
            group="expansions"
          >
            <q-separator />
            <q-form
              class="q-ma-md q-mt-lg"
              @submit.prevent="handleUpdatePassword"
            >
              <!-- Password change form -->
              <div class="row justify-center">
                <q-input
                  v-model="updatePasswordData.newPassword"
                  class="full-width"
                  style="max-width: 400px"
                  label="New Password"
                  input-class="text-body1"
                  :color="darkmode ? 'white' : 'black'"
                  type="password"
                  lazy-rules
                  outlined
                  :rules="[
                    (val) => (val && val.length > 7) || 'At least 8 characters',
                    (val) =>
                      (val && val.length < 100) ||
                      'Not more than 100 characters',
                    (val) =>
                      /(?=.*[a-z])/.test(val) || 'At least 1 lowercase letter',
                    (val) =>
                      /(?=.*[A-Z])/.test(val) || 'At least 1 uppercase letter',
                    (val) => /(?=.*[0-9])/.test(val) || 'At least 1 number',
                  ]"
                  no-error-icon
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>
              </div>
              <div class="row justify-center">
                <q-input
                  v-model="updatePasswordData.newPasswordConfirm"
                  class="q-mt-sm full-width"
                  style="max-width: 400px"
                  label="Confirm New Password"
                  input-class="text-body1"
                  :color="darkmode ? 'white' : 'black'"
                  no-error-icon
                  outlined
                  type="password"
                  lazy-rules
                  :rules="[
                    (val) =>
                      val == updatePasswordData.newPassword ||
                      'Passwords do not match',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                </q-input>
              </div>
              <div class="row justify-center">
                <q-input
                  v-model="updatePasswordData.password"
                  class="q-mt-sm full-width"
                  style="max-width: 400px"
                  label="Current Password"
                  input-class="text-body1"
                  outlined
                  :type="isPwd1 ? 'password' : 'text'"
                  :color="darkmode ? 'white' : 'black'"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd1 ? 'visibility' : 'visibility_off'"
                      @click="isPwd1 = !isPwd1"
                    />
                  </template>
                </q-input>
              </div>

              <q-btn
                class="full-width q-mb-md q-mt-lg"
                style="max-width: 350px"
                label="Change Password"
                size="lg"
                color="green"
                push
                type="submit"
                :loading="loading"
              />
            </q-form>
          </q-expansion-item>
          <q-separator />

          <div class="row">
            <q-space />
            <q-btn
              outline
              class="q-mt-md"
              @click="confirmDeleteAccountDialog = true"
            >
              Delete Account
            </q-btn>
          </div>
        </q-list>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { AccountType, UserProfileType } from 'src/types/index';
import { useSettings } from 'src/api/settings';
import DeleteAccountDialog from 'src/components/settings/DeleteAccountDialog.vue';

// Define props
const props = defineProps<{
  accountData: AccountType;
  profileData: UserProfileType;
}>();

// Setup composables
const localStore = useLocalStore();
const { updateEmail, updatePassword, getAccountInformation } = useSettings();

// State variables
const loading = ref(false);
const isPwd1 = ref(true);
const isPwd2 = ref(true);
const confirmDeleteAccountDialog = ref(false);

// Form data
const updateEmailData = ref({ newEmail: '', password: '' });
const updatePasswordData = ref({
  newPassword: '',
  newPasswordConfirm: '',
  password: '',
});

// Computed properties
const darkmode = computed(() => localStore.darkmode);

// Methods
const handleUpdatePassword = async () => {
  loading.value = true;
  const success = await updatePassword(
    updatePasswordData.value.newPassword,
    updatePasswordData.value.newPasswordConfirm,
    updatePasswordData.value.password
  );

  if (success) {
    updatePasswordData.value = {
      newPassword: '',
      newPasswordConfirm: '',
      password: '',
    };
  }

  loading.value = false;
};

const handleUpdateEmail = async () => {
  loading.value = true;
  const success = await updateEmail(
    updateEmailData.value.newEmail,
    updateEmailData.value.password
  );

  if (success) {
    updateEmailData.value = { newEmail: '', password: '' };
    getAccountInformation();
  }
  loading.value = false;
};
</script>
