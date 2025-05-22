<template>
  <!-- Header Row -->
  <div class="file-list-header">
    <!-- Checkbox column -->
    <div class="file-checkbox">
      <!-- Empty header for checkbox column -->
    </div>

    <!-- Icon column -->
    <div class="file-icon">
      <!-- Empty header for icon column -->
    </div>

    <!-- Filename column -->
    <div class="file-name text-weight-bold">Name</div>

    <!-- Size column -->
    <div class="file-size text-weight-bold">Size</div>

    <!-- Modified date column -->
    <div class="file-date text-weight-bold">Modified</div>

    <!-- Actions column -->
    <div class="file-actions">
      <!-- Empty header for actions column -->
    </div>
  </div>
</template>
<script setup>
const filter = '';
</script>
<style scoped>
/* Column layout styles */
.file-list-header {
  display: grid;
  grid-template-columns: 40px 35px minmax(100px, 1fr) 75px 170px 40px;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  background-color: rgba(var(--q-primary-rgb), 0.05);
  border-bottom: 1px solid rgba(var(--q-primary-rgb), 0.1);
}

.file-checkbox {
  width: 40px;
  min-width: 40px;
}

.file-icon {
  width: 35px;
  min-width: 35px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 100px;
}

.file-size {
  width: 75px;
  min-width: 75px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 20px;
}

.file-date {
  width: 170px;
  min-width: 170px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
}

.file-actions {
  width: 40px;
  min-width: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* Individual header cells */
.file-list-header > div:nth-child(1) {
  grid-column: 1;
  justify-self: center;
}

.file-list-header > div:nth-child(2) {
  grid-column: 2;
  justify-self: center;
}

.file-list-header > div:nth-child(3) {
  grid-column: 3;
  padding-left: 8px;
}

.file-list-header > div:nth-child(4) {
  grid-column: 4;
  text-align: right;
  padding-right: 20px;
}

.file-list-header > div:nth-child(5) {
  grid-column: 5;
  text-align: right;
}

.file-list-header > div:nth-child(6) {
  grid-column: 6;
  justify-self: center;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .file-list-header {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 75px 40px;
  }

  .file-list-header > div:nth-child(5) {
    display: none;
  }

  .file-item-content {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 75px 40px;
  }

  .file-date {
    display: none;
  }
}

@media (max-width: 480px) {
  .file-list-header {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 40px;
  }

  .file-list-header > div:nth-child(4) {
    display: none;
  }

  .file-item-content {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 40px;
  }

  .file-size {
    display: none;
  }
}
</style>
