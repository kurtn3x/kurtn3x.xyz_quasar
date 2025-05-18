<template>
  <!-- Mobile Header Card -->
  <q-card
    flat
    class="bg-transparent q-mb-md"
  >
    <div class="bg-primary q-pa-md">
      <div class="column items-center">
        <q-avatar
          size="120px"
          rounded
          class="q-mb-md shadow-3"
        >
          <q-img
            :src="user.avatar"
            class="full-height full-width"
          />
          <q-badge
            floating
            :color="user.role === 'Admin' ? 'negative' : 'info'"
            class="text-caption"
          >
            {{ user.role }}
          </q-badge>
        </q-avatar>

        <div
          class="text-h5 text-center text3d-primary text-weight-bold text-layout-text gradient-text non-selectable"
        >
          {{ user.username }}
        </div>

        <div class="row q-mt-md q-gutter-sm justify-center">
          <q-btn
            flat
            rounded
            dense
            color="white"
            icon="share"
          >
            <q-menu
              anchor="bottom middle"
              self="top middle"
            >
              <q-input
                filled
                square
                :model-value="userlink"
                readonly
              />
              <q-item
                clickable
                @click="copyToClipboard(userlink)"
                class="justify-center text-body1"
              >
                Copy the link
              </q-item>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>

    <q-separator size="1px" />
    <q-tabs
      v-model="profileTab"
      align="justify"
      inline-label
      indicator-color="transparent"
      active-color="layout-text"
      active-bg-color="primary"
    >
      <q-tab
        name="about"
        icon="person"
        label="About"
      />
      <q-tab
        name="placeholder"
        icon="block"
        label="More"
      />
    </q-tabs>

    <q-separator />

    <q-tab-panels
      v-model="profileTab"
      animated
      class="bg-transparent"
    >
      <q-tab-panel
        name="about"
        class="q-pa-sm"
      >
        <q-list
          bordered
          separator
        >
          <q-item>
            <q-item-section>
              <q-item-label overline>Name</q-item-label>
              <q-item-label>{{ user.name || 'Not specified' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Location</q-item-label>
              <q-item-label>
                {{ user.location || 'Not specified' }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Joined</q-item-label>
              <q-item-label>
                {{ user.dateJoined || 'Not available' }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Status</q-item-label>
              <q-item-label>
                {{ user.status || 'Not specified' }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label overline>Role</q-item-label>
              <q-item-label>{{ user.role || 'User' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <div class="text-subtitle1 text-weight-bold q-mt-md q-mb-sm">
          Description
        </div>
        <q-card
          flat
          bordered
        >
          <q-card-section>
            <div class="text-body2">
              {{
                user.description || 'This user has not added a description yet.'
              }}
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="placeholder">
        <div class="text-subtitle1 text-weight-bold">Placeholder Content</div>
        <p class="text-body2">This tab is available for future content.</p>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserProfileType } from 'src/types/index';
import { copyToClipboard } from 'src/components/lib/functions';

// Props
const props = defineProps<{
  user: UserProfileType;
  userlink: string;
}>();

// Local state
const profileTab = ref('about');
</script>
