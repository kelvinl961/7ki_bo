<template>
  <div class="novice-task-container">
    <!-- Header -->
    <div class="header-section">
      <h1>任务中心</h1>
      <p class="subtitle">管理用户任务，包括新人福利、每日任务、每周任务等</p>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <n-tabs v-model:value="activeTab" type="line" size="large">
        <n-tab-pane name="NOVICE_WELFARE" tab="新人福利">
          <TaskList
            :category="TaskCategory.NOVICE_WELFARE"
            @refresh="refreshData"
            @add="showAddModal"
            @edit="showEditModal"
            @detail="showDetailModal"
            @delete="handleDelete"
          />
        </n-tab-pane>
        
        <n-tab-pane name="DAILY_TASK" tab="每日任务">
          <TaskList
            :category="TaskCategory.DAILY_TASK"
            @refresh="refreshData"
            @add="showAddModal"
            @edit="showEditModal"
            @detail="showDetailModal"
            @delete="handleDelete"
          />
        </n-tab-pane>
        
        <n-tab-pane name="WEEKLY_TASK" tab="每周任务">
          <TaskList
            :category="TaskCategory.WEEKLY_TASK"
            @refresh="refreshData"
            @add="showAddModal"
            @edit="showEditModal"
            @detail="showDetailModal"
            @delete="handleDelete"
          />
        </n-tab-pane>
        
        <n-tab-pane name="THREE_DAY_RANKING" tab="三日冲榜任务">
          <TaskList
            :category="TaskCategory.THREE_DAY_RANKING"
            @refresh="refreshData"
            @add="showAddModal"
            @edit="showEditModal"
            @detail="showDetailModal"
            @delete="handleDelete"
          />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Task Setting Modal -->
    <NoviceTaskSettingModal
      v-model:visible="modalVisible"
      :mode="modalMode"
      :task-data="selectedTask"
      :category="activeTab as TaskCategory"
      @success="handleModalSuccess"
      @cancel="handleModalCancel"
    />

    <!-- Task Detail Modal -->
    <TaskDetailModal
      v-model:visible="detailModalVisible"
      :task-id="selectedTaskId"
      @close="detailModalVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide, defineAsyncComponent } from 'vue';
import { useMessage } from 'naive-ui';
import { TaskCategory, deleteTaskCenter, type TaskCenterItem } from '../../api/taskCenter';
// ✅ PERFORMANCE FIX: Lazy load components to avoid blocking page load
const TaskList = defineAsyncComponent(() => import('./components/TaskList.vue'));
const NoviceTaskSettingModal = defineAsyncComponent(() => import('./components/NoviceTaskSettingModal.vue'));
const TaskDetailModal = defineAsyncComponent(() => import('./components/TaskDetailModal.vue'));

const message = useMessage();

// Tab state
const activeTab = ref<TaskCategory>(TaskCategory.NOVICE_WELFARE);

// Modal state
const modalVisible = ref(false);
const modalMode = ref<'add' | 'edit'>('add');
const selectedTask = ref<TaskCenterItem | null>(null);

// Detail modal state
const detailModalVisible = ref(false);
const selectedTaskId = ref<number | null>(null);

// Refresh trigger
const refreshTrigger = ref(0);

// Provide refresh function to child components
provide('refreshTrigger', refreshTrigger);

// Methods
const refreshData = () => {
  refreshTrigger.value++;
};

const showAddModal = () => {
  modalMode.value = 'add';
  selectedTask.value = null;
  modalVisible.value = true;
};

const showEditModal = (task: TaskCenterItem) => {
  modalMode.value = 'edit';
  selectedTask.value = task;
  modalVisible.value = true;
};

const showDetailModal = (task: TaskCenterItem) => {
  selectedTaskId.value = task.id;
  detailModalVisible.value = true;
};

const handleDelete = async (id: number) => {
  try {
    await deleteTaskCenter(id);
    message.success('任务删除成功');
    refreshData();
  } catch (error) {
    message.error('删除任务失败');
    console.error('Delete task error:', error);
  }
};

const handleModalSuccess = () => {
  modalVisible.value = false;
  refreshData();
  message.success(modalMode.value === 'add' ? '任务创建成功' : '任务更新成功');
};

const handleModalCancel = () => {
  modalVisible.value = false;
  selectedTask.value = null;
};

// Lifecycle
onMounted(() => {
  refreshData();
});
</script>

<style scoped lang="scss">
.novice-task-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;

  .header-section {
    margin-bottom: 24px;
    padding: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }

  .tab-navigation {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 0;
    overflow: hidden;

    :deep(.n-tabs) {
      .n-tabs-nav {
        background: #fafafa;
        border-bottom: 1px solid #e8e8e8;
        padding: 0 24px;
        
        .n-tabs-tab {
          padding: 16px 24px;
          font-weight: 500;
          font-size: 14px;
          
          &.n-tabs-tab--active {
            color: #1890ff;
          }
        }
      }
      
      .n-tabs-content {
        padding: 24px;
      }
    }
  }
}

// Dark mode support
:deep(.dark) {
  .novice-task-container {
    background: #1a1a1a;
    
    .header-section {
      background: #2a2a2a;
      color: #fff;
      
      h1 {
        color: #fff;
      }
      
      .subtitle {
        color: #ccc;
      }
    }
    
    .tab-navigation {
      background: #2a2a2a;
      
      .n-tabs-nav {
        background: #333;
        border-bottom-color: #444;
      }
    }
  }
}
</style> 