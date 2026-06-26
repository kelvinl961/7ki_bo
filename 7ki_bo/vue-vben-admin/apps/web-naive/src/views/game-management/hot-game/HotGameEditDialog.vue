<template>
  <n-modal
    :show="visible"
    :title="isEditing ? $t('game.hotGameExtra.editHotGame') : $t('game.hotGameExtra.addHotGame')"
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
      <n-form-item :label="$t('game.subgame.platformName')" path="platformId">
        <n-select
          v-model:value="formData.platformId"
          :placeholder="$t('game.subgame.selectPlatform')"
          :options="platformOptions"
          :disabled="isEditing"
        />
      </n-form-item>

      <n-form-item :label="$t('game.subgame.gameId')" path="gameId">
        <n-input
          v-model:value="formData.gameId"
          :placeholder="$t('game.subgame.enterGameId')"
          :disabled="isEditing"
        />
      </n-form-item>

      <n-form-item :label="$t('game.hotGameExtra.hotName', 'Hot Name')" path="gameName">
        <n-input
          v-model:value="formData.gameName"
          :placeholder="$t('game.hotGameExtra.enterHotName', 'Enter hot name')"
        />
      </n-form-item>

      <n-form-item :label="$t('game.betRecords.gameType')" path="gameCategory">
        <n-select
          v-model:value="formData.gameCategory"
          :placeholder="$t('game.subgame.selectGameType')"
          :options="gameCategoryOptions"
        />
      </n-form-item>

      <n-form-item :label="$t('game.hotGameExtra.tagType', 'Hot/Recycle')" path="tagType">
        <n-select
          v-model:value="formData.tagType"
          :placeholder="$t('game.hotGameExtra.selectTagType', 'Select tag type')"
          :options="tagTypeOptions"
        />
      </n-form-item>

      <n-form-item :label="$t('common.currency')" path="currency">
        <n-select
          v-model:value="formData.currency"
          :placeholder="$t('game.subgame.selectCurrency')"
          :options="currencyOptions"
        />
      </n-form-item>

      <n-form-item :label="$t('game.subgame.sortOrder')" path="sortOrder">
        <n-input-number
          v-model:value="formData.sortOrder"
          :placeholder="$t('game.subgame.enterSortOrder')"
          :min="0"
          :max="9999"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item :label="$t('common.remark')" path="remark">
        <n-input
          v-model:value="formData.remark"
          :placeholder="$t('common.pleaseEnter')"
          type="textarea"
          :rows="3"
          :maxlength="200"
          show-count
        />
      </n-form-item>

      <n-form-item :label="$t('common.enabled')" path="isEnabled">
        <n-switch v-model:value="formData.isEnabled" />
      </n-form-item>
    </n-form>

    <template #action>
      <div class="flex justify-end gap-2">
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? $t('common.save') : $t('common.create') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

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
  { label: $t('game.hotGameExtra.tagHot'), value: 'hot' },
  { label: $t('game.hotGameExtra.tagRecycled'), value: 'recycled' },
];

const formRules: FormRules = {
  platformId: [
    {
      required: true,
      message: $t('game.hotGameExtra.selectPlatformRequired'),
      trigger: 'change',
      type: 'number',
    },
  ],
  gameId: [
    { required: true, message: $t('game.subgame.enterGameId'), trigger: 'blur' },
    { min: 1, max: 50, message: $t('game.hotGameExtra.gameIdLength'), trigger: 'blur' },
  ],
  gameName: [
    { required: true, message: $t('game.hotGameExtra.enterHotName'), trigger: 'blur' },
    { min: 1, max: 100, message: $t('game.hotGameExtra.hotNameLength'), trigger: 'blur' },
  ],
  gameCategory: [
    { required: true, message: $t('game.hotGameExtra.selectGameTypeRequired'), trigger: 'change' },
  ],
  tagType: [{ required: true, message: $t('game.hotGameExtra.selectTagTypeRequired'), trigger: 'change' }],
  currency: [{ required: true, message: $t('game.virtualBonusPool.selectCurrencyRequired'), trigger: 'change' }],
  sortOrder: [
    {
      required: true,
      message: $t('game.hotGameExtra.sortOrderRequired'),
      trigger: 'blur',
      type: 'number',
    },
    {
      min: 0,
      max: 9999,
      message: $t('game.hotGameExtra.sortOrderRange'),
      trigger: 'blur',
      type: 'number',
    },
  ],
  remark: [{ max: 200, message: $t('game.hotGameExtra.remarkMaxLength'), trigger: 'blur' }],
};


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
    
    const platformResponse = await getGamePlatformListApi({ pageSize: 1000 });
    platformOptions.value =
      platformResponse.list?.map((platform: GamePlatformItem) => ({
        label: platform.platformName,
        value: platform.id,
      })) || [];

    
    const categories = await getGameCategoriesApi();
    gameCategoryOptions.value = categories.map((category) => ({
      label: category,
      value: category,
    }));

    
    const currencies = await getCurrenciesApi();
    currencyOptions.value = currencies.map((currency) => ({
      label: currency,
      value: currency,
    }));
  } catch (error) {
    console.error('加载选项失败:', error);
    notification.error({
      content: $t('game.loadFailed'),
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
        content: $t('game.hotGameExtra.updateSuccess'),
        duration: 3000,
      });
    } else {
      await createHotGameApi(data as CreateHotGameParams);
      notification.success({
        content: $t('game.hotGameExtra.createSuccess'),
        duration: 3000,
      });
    }

    emit('success');
    handleCancel();
  } catch (error: any) {
    console.error('提交失败:', error);
    notification.error({
      content: error?.message || $t('common.operationFailed'),
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
