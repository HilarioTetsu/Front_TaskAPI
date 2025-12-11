<script setup lang="ts">
import SidebarNav from './SidebarNav.vue';
import TopBar from './TopBar.vue';
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-800">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-slate-800">
        <span class="font-semibold tracking-tight text-lg">
          Task<span class="text-amber-400">Enterprise</span>
        </span>
      </div>
      <SidebarNav class="flex-1 overflow-y-auto" />
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main class="flex-1 px-8 py-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
