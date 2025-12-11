<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvitationsStore } from '../../stores/invitations';

// Heroicons
import {
  Squares2X2Icon,
  FolderIcon,
  InboxIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const route = useRoute();
const invitationsStore = useInvitationsStore();

type NavItem = {
  name: string;
  routeName: string;
  icon: any;
};

const items: NavItem[] = [
  { name: 'Dashboard', routeName: 'dashboard', icon: Squares2X2Icon },
  { name: 'Proyectos', routeName: 'projects', icon: FolderIcon },
  { name: 'Invitaciones', routeName: 'invitations', icon: InboxIcon },
];

// Contador de invitaciones pendientes (el store ya las carga desde App.vue)
const pendingInvites = computed(
  () => invitationsStore.invitations.length ?? 0
);

const isActive = (name: string) => route.name === name;
</script>

<template>
  <nav class="mt-4 px-2 space-y-1 text-sm">
    <button
      v-for="item in items"
      :key="item.routeName"
      type="button"
      @click="router.push({ name: item.routeName })"
      class="flex w-full items-center gap-3 rounded-md px-3 py-2 font-medium transition-colors"
      :class="
        isActive(item.routeName)
          ? 'bg-slate-800 text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      "
    >
      <component
        :is="item.icon"
        class="h-5 w-5"
        :class="item.routeName === 'projects' ? 'text-amber-400' : ''"
      />
      <span>{{ item.name }}</span>

      <!-- Badge sólo para Invitaciones -->
      <span
        v-if="item.routeName === 'invitations' && pendingInvites > 0"
        class="ml-auto inline-flex items-center justify-center rounded-full bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-slate-900"
      >
        {{ pendingInvites }}
      </span>
    </button>
  </nav>
</template>
