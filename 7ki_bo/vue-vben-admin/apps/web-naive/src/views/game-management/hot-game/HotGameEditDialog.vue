<template>
  <n-modal
    :show="visible"
    :title="isEditing ? '修改热门游戏' : '添加热门游戏'"
    preset="dialog"
    style="width: 600px"
    @update:show="handleUpdateVisible"
    @after-leave="handleAfterLeave"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-placement="left"
      label-width="120"
      class="mt-4"
    >
      <n-form-item label="平台名称" path="platformId">
        <n-select
          v-model:value="formData.platformId"
          placeholder="选择平台"
          :options="platformOptions"
          :disabled="isEditing"
        />
      </n-form-item>

      <n-form-item label="游戏ID" path="gameId">
        <n-input
          v-model:value="formData.gameId"
          placeholder="请输入游戏ID"
          :disabled="isEditing"
        />
      </n-form-item>

      <n-form-item label="热门名称" path="gameName">
        <n-input
          v-model:value="formData.gameName"
          placeholder="请输入热门名称"
        />
      </n-form-item>

      <n-form-item label="游戏类型" path="gameCategory">
        <n-select
          v-model:value="formData.gameCategory"
          placeholder="选择游戏类型"
          :options="gameCategoryOptions"
        />
      </n-form-item>

      <n-form-item label="热门/回收" path="tagType">
        <n-select
          v-model:value="formData.tagType"
          placeholder="选择标签类型"
          :options="tagTypeOptions"
        />
      </n-form-item>

      <n-form-item label="币种" path="currency">
        <n-select
          v-model:value="formData.currency"
          placeholder="选择币种"
          :options="currencyOptions"
        />
      </n-form-item>

      <n-form-item label="排序" path="sortOrder">
        <n-input-number
          v-model:value="formData.sortOrder"
          placeholder="请输入排序值"
          :min="0"
          :max="9999"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="备注" path="remark">
        <n-input
          v-model:value="formData.remark"
          placeholder="请输入备注"
          type="textarea"
          :rows="3"
          :maxlength="200"
          show-count
        />
      </n-form-item>

      <n-form-item label="是否启用" path="isEnabled">
        <n-switch v-model:value="formData.isEnabled" />
      </n-form-item>
    </n-form>

    <template #action>
      <div class="flex justify-end gap-2">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? '更新' : '创建' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSwitch,
} from 'naive-ui';
import { notification } from '#/adapter/naive';
import {
  createHotGameApi,
  updateHotGameApi,
  getGameCategoriesApi,
  getCurrenciesApi,
  type HotGameItem,
  type CreateHotGameParams,
  type UpdateHotGameParams,
} from '#/api/game/hotGame';
import {
  getGamePlatformListApi,
  type GamePlatformItem,
} from '#/api/game/platform';

interface Props {
  visible: boolean;
  hotGameData?: HotGameItem | null;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInst | null>(null);
const submitting = ref(false);
const platformOptions = ref<Array<{ label: string; value: number }>>([]);
const gameCategoryOptions = ref<Array<{ label: string; value: string }>>([]);
const currencyOptions = ref<Array<{ label: string; value: string }>>([]);

const isEditing = computed(() => !!props.hotGameData);

const formData = reactive({
  platformId: undefined as number | undefined,
  gameId: '',
  gameName: '',
  gameCategory: '',
  tagType: 'hot' as 'hot' | 'recycled',
  currency: 'BRL',
  sortOrder: 0,
  remark: '',
  isEnabled: true,
});

const tagTypeOptions = [
  { label: '热门', value: 'hot' },
  { label: '回收', value: 'recycled' },
];

const formRules: FormRules = {
  platformId: [
    {
      required: true,
      message: '请选择平台',
      trigger: 'change',
      type: 'number',
    },
  ],
  gameId: [
    { required: true, message: '请输入游戏ID', trigger: 'blur' },
    { min: 1, max: 50, message: '游戏ID长度为1-50个字符', trigger: 'blur' },
  ],
  gameName: [
    { required: true, message: '请输入热门名称', trigger: 'blur' },
    { min: 1, max: 100, message: '热门名称长度为1-100个字符', trigger: 'blur' },
  ],
  gameCategory: [
    { required: true, message: '请选择游戏类型', trigger: 'change' },
  ],
  tagType: [{ required: true, message: '请选择标签类型', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  sortOrder: [
    {
      required: true,
      message: '请输入排序值',
      trigger: 'blur',
      type: 'number',
    },
    {
      min: 0,
      max: 9999,
      message: '排序值范围为0-9999',
      trigger: 'blur',
      type: 'number',
    },
  ],
  remark: [{ max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }],
};

// 监听 visible 变化
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadFormData();
      loadOptions();
    }
  },
  { immediate: true },
);

// 监听 hotGameData 变化
watch(
  () => props.hotGameData,
  (newVal) => {
    if (newVal && props.visible) {
      loadFormData();
    }
  },
  { deep: true },
);

const loadFormData = () => {
  if (props.hotGameData) {
    // 编辑模式
    formData.platformId = props.hotGameData.platformId;
    formData.gameId = props.hotGameData.gameId;
    formData.gameName = props.hotGameData.gameName;
    formData.gameCategory = props.hotGameData.gameCategory;
    formData.tagType = props.hotGameData.tagType;
    formData.currency = props.hotGameData.currency;
    formData.sortOrder = props.hotGameData.sortOrder;
    formData.remark = props.hotGameData.remark || '';
    formData.isEnabled = props.hotGameData.isEnabled;
  } else {
    // 新增模式
    resetForm();
  }
};

const resetForm = () => {
  formData.platformId = undefined;
  formData.gameId = '';
  formData.gameName = '';
  formData.gameCategory = '';
  formData.tagType = 'hot';
  formData.currency = 'BRL';
  formData.sortOrder = 0;
  formData.remark = '';
  formData.isEnabled = true;
};

const loadOptions = async () => {
  try {
    // 加载平台选项
    const platformResponse = await getGamePlatformListApi({ pageSize: 1000 });
    platformOptions.value =
      platformResponse.list?.map((platform: GamePlatformItem) => ({
        label: platform.platformName,
        value: platform.id,
      })) || [];

    // 加载游戏类型选项
    const categories = await getGameCategoriesApi();
    gameCategoryOptions.value = categories.map((category) => ({
      label: category,
      value: category,
    }));

    // 加载币种选项
    const currencies = await getCurrenciesApi();
    currencyOptions.value = currencies.map((currency) => ({
      label: currency,
      value: currency,
    }));
  } catch (error) {
    console.error('加载选项失败:', error);
    notification.error({
      content: '加载选项失败',
      duration: 3000,
    });
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    const data = {
      platformId: formData.platformId!,
      gameId: formData.gameId,
      gameName: formData.gameName,
      gameCategory: formData.gameCategory,
      tagType: formData.tagType,
      currency: formData.currency,
      sortOrder: formData.sortOrder,
      remark: formData.remark || undefined,
      isEnabled: formData.isEnabled,
    };

    if (isEditing.value) {
      await updateHotGameApi(
        props.hotGameData!.id,
        data as UpdateHotGameParams,
      );
      notification.success({
        content: '更新成功',
        duration: 3000,
      });
    } else {
      await createHotGameApi(data as CreateHotGameParams);
      notification.success({
        content: '创建成功',
        duration: 3000,
      });
    }

    emit('success');
    handleCancel();
  } catch (error: any) {
    console.error('提交失败:', error);
    notification.error({
      content: error?.message || '操作失败',
      duration: 3000,
    });
  } finally {
    submitting.value = false;
  }
};

const handleUpdateVisible = (value: boolean) => {
  emit('update:visible', value);
};

const handleCancel = () => {
  emit('update:visible', false);
};

const handleAfterLeave = () => {
  resetForm();
  formRef.value?.restoreValidation();
};
</script>
