<template>
  <n-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-placement="left"
    label-width="auto"
    require-mark-placement="right-hanging"
  >
    <n-grid :cols="2" :x-gap="24">
      <n-form-item-gi label="平台ID" path="platformId">
        <n-input
          v-model:value="formData.platformId"
          placeholder="请输入平台ID"
          :disabled="isEdit"
        />
      </n-form-item-gi>

      <n-form-item-gi label="平台名称" path="platformName">
        <n-input
          v-model:value="formData.platformName"
          placeholder="请输入平台名称"
        />
      </n-form-item-gi>

      <n-form-item-gi label="游戏类型" path="gameType">
        <n-select
          v-model:value="formData.gameType"
          placeholder="请选择游戏类型"
          :options="gameTypeOptions"
        />
      </n-form-item-gi>

      <n-form-item-gi label="币种" path="currency">
        <n-input
          v-model:value="formData.currency"
          placeholder="请输入币种，如BRL、USD"
        />
      </n-form-item-gi>

      <n-form-item-gi label="最低准入" path="minEntryAmount">
        <n-input-number
          v-model:value="formData.minEntryAmount"
          :min="0"
          :precision="2"
          placeholder="请输入最低准入金额"
          style="width: 100%"
        />
      </n-form-item-gi>

      <n-form-item-gi label="子游戏数量" path="subGameCount">
        <n-input-number
          v-model:value="formData.subGameCount"
          :min="0"
          placeholder="请输入子游戏数量"
          style="width: 100%"
        />
      </n-form-item-gi>

      <n-form-item-gi label="IOS跳转方式" path="iosJumpType">
        <n-select
          v-model:value="formData.iosJumpType"
          placeholder="请选择IOS跳转方式"
          :options="jumpTypeOptions"
        />
      </n-form-item-gi>

      <n-form-item-gi label="Android跳转方式" path="androidJumpType">
        <n-select
          v-model:value="formData.androidJumpType"
          placeholder="请选择Android跳转方式"
          :options="jumpTypeOptions"
        />
      </n-form-item-gi>
    </n-grid>

    <n-form-item label="宣传图URL" path="imageUrl">
      <div class="w-full">
        <n-upload
          v-model:file-list="imageFileList"
          action="/upload"
          :headers="uploadHeaders"
          :max="1"
          list-type="image-card"
          accept="image/*"
          @change="handleImageUploadChange"
          @finish="handleImageUploadFinish"
          @error="handleUploadError"
        >
          <n-upload-trigger #="{ handleClick }" abstract>
            <div
              v-if="!formData.imageUrl"
              class="upload-trigger"
              @click="handleClick"
            >
              <n-icon size="32" :depth="3">
                <CloudUploadOutline />
              </n-icon>
              <div class="upload-text">上传宣传图</div>
            </div>
          </n-upload-trigger>
        </n-upload>

        <div v-if="formData.imageUrl && !imageFileList.length" class="image-preview">
          <n-image
            :src="formData.imageUrl"
            :alt="formData.platformName"
            width="150"
            height="100"
            object-fit="cover"
            class="preview-image"
          />
          <div class="image-actions">
            <n-button size="small" @click="handleReplaceImage">
              替换
            </n-button>
            <n-button size="small" type="error" @click="handleRemoveImage">
              删除
            </n-button>
          </div>
        </div>

        <n-input
          v-model:value="formData.imageUrl"
          placeholder="或输入宣传图 URL"
          style="margin-top: 8px"
        />
      </div>
    </n-form-item>

    <n-divider>状态设置</n-divider>

    <n-grid :cols="2" :x-gap="24">
      <n-form-item-gi label="热门">
        <n-switch v-model:value="formData.isHot" />
      </n-form-item-gi>

      <n-form-item-gi label="热门推荐">
        <n-switch v-model:value="formData.isFeatured" />
      </n-form-item-gi>

      <n-form-item-gi label="显示给主播">
        <n-switch v-model:value="formData.showToStreamer" />
      </n-form-item-gi>

      <n-form-item-gi label="展示给主播">
        <n-switch v-model:value="formData.streamerVisible" />
      </n-form-item-gi>

      <n-form-item-gi label="平台开关">
        <n-switch v-model:value="formData.isEnabled" />
      </n-form-item-gi>

      <n-form-item-gi label="排序权重" path="sortOrder">
        <n-input-number
          v-model:value="formData.sortOrder"
          :min="0"
          placeholder="数值越大越靠前"
          style="width: 100%"
        />
        <n-text depth="3" style="font-size: 12px; margin-top: 4px">
          用于置顶功能，数值越大排序越靠前
        </n-text>
      </n-form-item-gi>
    </n-grid>
  </n-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import type { FormRules, UploadFileInfo } from 'naive-ui';
import {
  NButton,
  NDivider,
  NForm,
  NFormItem,
  NFormItemGi,
  NGrid,
  NIcon,
  NImage,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NText,
  NUpload,
  NUploadTrigger,
} from 'naive-ui';
import { CloudUploadOutline } from '@vicons/ionicons5';
import { notification } from '#/adapter/naive';
import type { GamePlatformRecord, CreateGamePlatformParams } from '#/api/game/gamePlatform';

interface Props {
  initialData?: GamePlatformRecord;
  isEdit?: boolean;
}

interface Emits {
  (e: 'submit', data: CreateGamePlatformParams): void;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEdit: false,
});

const emit = defineEmits<Emits>();

// 响应式数据
const formRef = ref();
const imageFileList = ref<UploadFileInfo[]>([]);

// 表单数据
const formData = reactive<CreateGamePlatformParams>({
  platformId: '',
  platformName: '',
  gameType: '',
  currency: 'BRL',
  isHot: false,
  isFeatured: false,
  showToStreamer: false,
  isEnabled: true,
  streamerVisible: false,
  subGameCount: 0,
  minEntryAmount: 0,
  imageUrl: '',
  iosJumpType: '内嵌',
  androidJumpType: '内嵌',
  sortOrder: 0,
});

// 选项数据
const gameTypeOptions = [
  { label: '模拟', value: '模拟' },
  { label: '捕鱼', value: '捕鱼' },
  { label: '电子', value: '电子' },
  { label: '真人', value: '真人' },
  { label: '体育', value: '体育' },
  { label: '斗鸡', value: '斗鸡' },
  { label: '电竞', value: '电竞' },
  { label: '彩票', value: '彩票' },
  { label: '街机', value: '街机' },
  { label: '区块链', value: '区块链' },
];

const jumpTypeOptions = [
  { label: '内嵌', value: '内嵌' },
  { label: '外链', value: '外链' },
];

// 上传头部
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
};

// 表单验证规则
const formRules: FormRules = {
  platformId: [
    { required: true, message: '平台ID不能为空', trigger: 'blur' },
    { max: 50, message: '平台ID不能超过50个字符', trigger: 'blur' },
  ],
  platformName: [
    { required: true, message: '平台名称不能为空', trigger: 'blur' },
    { max: 100, message: '平台名称不能超过100个字符', trigger: 'blur' },
  ],
  gameType: [
    { required: true, message: '游戏类型不能为空', trigger: 'change' },
  ],
  currency: [
    { required: true, message: '币种不能为空', trigger: 'blur' },
    { max: 10, message: '币种不能超过10个字符', trigger: 'blur' },
  ],
  imageUrl: [
    { type: 'url', message: '请输入有效的图片URL', trigger: 'blur' },
  ],
};

// 初始化表单数据
const initFormData = () => {
  if (props.initialData) {
    console.log('GamePlatformForm initialData changed:', props.initialData);
    Object.assign(formData, {
      platformId: props.initialData.platformId,
      platformName: props.initialData.platformName,
      gameType: props.initialData.gameType,
      currency: props.initialData.currency,
      isHot: props.initialData.isHot,
      isFeatured: props.initialData.isFeatured,
      showToStreamer: props.initialData.showToStreamer,
      isEnabled: props.initialData.isEnabled,
      streamerVisible: props.initialData.streamerVisible,
      subGameCount: Number(props.initialData.subGameCount) || 0,
      minEntryAmount: Number(props.initialData.minEntryAmount) || 0,
      imageUrl: props.initialData.imageUrl || '',
      iosJumpType: props.initialData.iosJumpType,
      androidJumpType: props.initialData.androidJumpType,
      sortOrder: Number(props.initialData.sortOrder) || 0,
    });
    console.log('GamePlatformForm formData after assign:', { ...formData });
  }
};

// 上传处理函数
const handleImageUploadChange = (options: { fileList: UploadFileInfo[] }) => {
  imageFileList.value = options.fileList;
};

const handleImageUploadFinish = ({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) => {
  if (event?.target) {
    const response = JSON.parse((event.target as XMLHttpRequest).response);
    if (response.success) {
      formData.imageUrl = response.data.url;
      notification.success({ content: '宣传图上传成功', duration: 3000 });
    }
  }
};

const handleUploadError = () => {
  notification.error({ content: '图片上传失败', duration: 3000 });
};

// 替换和删除图片
const handleReplaceImage = () => {
  formData.imageUrl = '';
  imageFileList.value = [];
};

const handleRemoveImage = () => {
  formData.imageUrl = '';
  imageFileList.value = [];
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    emit('submit', formData);
  } catch (error) {
    console.error('Form validation failed:', error);
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.restoreValidation();
  imageFileList.value = [];
  initFormData();
};

// 监听 props 变化
watch(() => props.initialData, () => {
  nextTick(() => {
    initFormData();
  });
}, { immediate: true });

// 暴露方法
defineExpose({
  handleSubmit,
  resetForm,
});
</script>

<style scoped>
.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-trigger:hover {
  border-color: #40a9ff;
}

.upload-text {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.image-preview {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.preview-image {
  border-radius: 6px;
  border: 1px solid #d9d9d9;
}

.image-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 