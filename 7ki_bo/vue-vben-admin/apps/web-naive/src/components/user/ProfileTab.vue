<template>
  <div class="profile-tab">
    <div v-if="loading" class="flex h-96 items-center justify-center">
      <n-spin size="large" />
    </div>

    <div v-else class="profile-content">
      <!-- Section 1: 用户个人资料字段 -->
      <n-card title="个人资料" class="mb-4">
        <div class="profile-fields">
          <!-- Profile Picture Section -->
          <div class="profile-picture-section mb-6">
            <div class="flex items-center gap-4">
              <div class="profile-picture-container">
                <n-avatar
                  v-if="profile.idPhotoUrl"
                  :size="80"
                  :src="profile.idPhotoUrl"
                  @click="showProfilePhotoPreview = true"
                  class="cursor-pointer transition-opacity hover:opacity-80"
                />
                <n-avatar
                  v-else
                  :size="80"
                  class="flex items-center justify-center bg-gray-200"
                >
                  <n-icon size="32" color="#999">
                    <PersonOutline />
                  </n-icon>
                </n-avatar>
              </div>
              <div class="profile-picture-info">
                <h3 class="mb-2 text-lg font-medium">个人头像</h3>
                <p class="mb-3 text-sm text-gray-600">
                  {{ profile.idPhotoUrl ? '已上传头像' : '未上传头像' }}
                </p>
                <div class="flex gap-2">
                  <n-upload
                    accept="image/*"
                    :max="1"
                    :show-file-list="false"
                    @change="handleProfilePhotoUpload"
                  >
                    <n-button size="small" type="primary">
                      {{ profile.idPhotoUrl ? '更换头像' : '上传头像' }}
                    </n-button>
                  </n-upload>
                  <n-button
                    v-if="profile.idPhotoUrl"
                    size="small"
                    @click="showProfilePhotoPreview = true"
                  >
                    查看
                  </n-button>
                </div>
              </div>
            </div>
          </div>

          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <!-- 姓名 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">姓名</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'name'">
                    {{ profile.name || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('name')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 身份证号 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">身份证号</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'idNumber'">
                    {{ maskedIdNumber }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="info"
                    class="ml-2"
                    @click="toggleIdNumberView"
                  >
                    {{ showFullIdNumber ? '隐藏' : '查看' }}
                  </n-button>
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-1"
                    @click="handleEditField('idNumber')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 国籍/地区 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">国籍/地区</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'nationality'">
                    {{ profile.nationality || '--' }}
                  </span>
                  <n-select
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    :options="nationalityOptions"
                    @blur="handleSaveField"
                    @update:value="handleSaveField"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('nationality')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 永久居住地 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">永久居住地</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'residence'">
                    {{ profile.residence || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('residence')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 工作单位 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">工作单位</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'employer'">
                    {{ profile.employer || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('employer')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 职业名称 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">职业名称</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'occupation'">
                    {{ profile.occupation || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('occupation')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 性别 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">性别</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'gender'">
                    {{ profile.gender || '--' }}
                  </span>
                  <n-select
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    :options="genderOptions"
                    @blur="handleSaveField"
                    @update:value="handleSaveField"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('gender')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 生日 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">生日</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'birthday'">
                    {{ formatDate(profile.birthday) || '--' }}
                  </span>
                  <n-date-picker
                    v-else
                    v-model:value="editingDateValue"
                    type="date"
                    size="small"
                    @blur="handleSaveDateField"
                    @update:value="handleSaveDateField"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditDateField('birthday')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 出生地 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">出生地</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'placeOfBirth'">
                    {{ profile.placeOfBirth || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('placeOfBirth')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 当前居住地 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">当前居住地</div>
                <div class="field-value">
                  <span
                    v-if="!editingField || editingField !== 'currentAddress'"
                  >
                    {{ profile.currentAddress || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('currentAddress')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 收入来源 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">收入来源</div>
                <div class="field-value">
                  <span v-if="!editingField || editingField !== 'incomeSource'">
                    {{ profile.incomeSource || '--' }}
                  </span>
                  <n-input
                    class="black-input"
                    v-else
                    v-model:value="editingValue"
                    size="small"
                    @blur="handleSaveField"
                    @keyup.enter="handleSaveField"
                    @keyup.escape="handleCancelEdit"
                  />
                  <n-button
                    text
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="handleEditField('incomeSource')"
                  >
                    修改
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 人脸比对 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">人脸比对</div>
                <div class="field-value">
                  <span>{{ profile.faceMatchStatus || '未验证' }}</span>
                  <n-button
                    text
                    size="small"
                    type="info"
                    class="ml-2"
                    @click="showFaceMatchModal = true"
                  >
                    查看记录
                  </n-button>
                </div>
              </div>
            </n-gi>

            <!-- 手持身份证照片 -->
            <n-gi>
              <div class="profile-field">
                <div class="field-label">手持身份证照片</div>
                <div class="field-value">
                  <div class="flex items-center gap-2">
                    <n-avatar
                      v-if="profile.idPhotoUrl"
                      :size="40"
                      :src="profile.idPhotoUrl"
                      @click="showPhotoPreview = true"
                      class="cursor-pointer"
                    />
                    <span v-else>未上传</span>
                    <n-upload
                      accept="image/*"
                      :max="1"
                      :show-file-list="false"
                      @change="handlePhotoUpload"
                    >
                      <n-button text size="small" type="primary">
                        {{ profile.idPhotoUrl ? '重新上传' : '上传' }}
                      </n-button>
                    </n-upload>
                  </div>
                </div>
              </div>
            </n-gi>
          </n-grid>
        </div>

        <template #action>
          <n-space>
            <n-button size="small" @click="handleRefreshProfile">
              刷新
            </n-button>
            <n-button size="small" type="primary" @click="handleSaveAllProfile">
              保存所有修改
            </n-button>
          </n-space>
        </template>
      </n-card>

      <!-- Section 2: 账户安全状态 -->
      <n-card title="账户安全状态" class="mb-4">
        <div class="security-status">
          <n-grid :cols="4" :x-gap="16" :y-gap="16">
            <n-gi>
              <div class="security-item">
                <div class="security-label">手机绑定</div>
                <n-tag
                  :type="securityStatus.phoneBinding ? 'success' : 'warning'"
                >
                  {{ securityStatus.phoneBinding ? '已绑定' : '未绑定' }}
                </n-tag>
              </div>
            </n-gi>
            <n-gi>
              <div class="security-item">
                <div class="security-label">谷歌验证</div>
                <n-tag
                  :type="securityStatus.googleAuth ? 'success' : 'warning'"
                >
                  {{ securityStatus.googleAuth ? '已绑定' : '未绑定' }}
                </n-tag>
              </div>
            </n-gi>
            <n-gi>
              <div class="security-item">
                <div class="security-label">生物识别</div>
                <n-tag
                  :type="securityStatus.biometricAuth ? 'success' : 'warning'"
                >
                  {{ securityStatus.biometricAuth ? '已绑定' : '未绑定' }}
                </n-tag>
              </div>
            </n-gi>
            <n-gi>
              <div class="security-item">
                <div class="security-label">密钥验证</div>
                <n-tag :type="securityStatus.keyAuth ? 'success' : 'warning'">
                  {{ securityStatus.keyAuth ? '已设置' : '未设置' }}
                </n-tag>
              </div>
            </n-gi>
          </n-grid>
        </div>
      </n-card>
    </div>

    <!-- Face Match Logs Modal -->
    <n-modal
      v-model:show="showFaceMatchModal"
      preset="dialog"
      title="人脸比对记录"
    >
      <div class="face-match-logs">
        <n-empty v-if="!faceMatchLogs.length" description="暂无记录" />
        <div v-else class="space-y-4">
          <div
            v-for="log in faceMatchLogs"
            :key="log.id"
            class="log-item rounded border p-3"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ log.status }}</span>
              <span class="text-sm text-gray-500">{{
                formatDateTime(log.timestamp)
              }}</span>
            </div>
            <div class="mt-1 text-sm text-gray-600">
              相似度: {{ (log.confidence * 100).toFixed(1) }}% | IP:
              {{ log.ipAddress }}
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <n-button @click="showFaceMatchModal = false">关闭</n-button>
      </template>
    </n-modal>

    <!-- Photo Preview Modal -->
    <n-modal v-model:show="showPhotoPreview" preset="dialog" title="身份证照片">
      <div class="photo-preview">
        <img
          v-if="profile.idPhotoUrl"
          :src="profile.idPhotoUrl"
          alt="身份证照片"
          class="mx-auto max-h-96 max-w-full"
        />
      </div>

      <template #action>
        <n-button @click="showPhotoPreview = false">关闭</n-button>
      </template>
    </n-modal>

    <!-- Profile Photo Preview Modal -->
    <n-modal
      v-model:show="showProfilePhotoPreview"
      preset="dialog"
      title="个人头像"
    >
      <div class="profile-photo-preview">
        <img
          v-if="profile.idPhotoUrl"
          :src="profile.idPhotoUrl"
          alt="个人头像"
          class="mx-auto max-h-96 max-w-full rounded-lg"
        />
      </div>

      <template #action>
        <n-button @click="showProfilePhotoPreview = false">关闭</n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  NCard,
  NGrid,
  NGi,
  NButton,
  NInput,
  NSelect,
  NDatePicker,
  NUpload,
  NAvatar,
  NSpace,
  NModal,
  NTag,
  NEmpty,
  NSpin,
  NIcon,
  useMessage,
  type UploadFileInfo,
} from 'naive-ui';
import { PersonOutline } from '@vicons/ionicons5';
import {
  getUserProfileApi,
  updateUserProfileApi,
  uploadIdPhotoApi,
  getUserSecurityStatusApi,
  getFaceMatchLogsApi,
  type UserProfile,
  type UpdateProfileParams,
} from '#/api/core/user-detail';

interface Props {
  userId: number;
}

const props = defineProps<Props>();
const message = useMessage();

// State
const loading = ref(false);
const showFaceMatchModal = ref(false);
const showPhotoPreview = ref(false);
const showProfilePhotoPreview = ref(false);
const showFullIdNumber = ref(false);

// Profile data
const profile = ref<UserProfile>({
  id: 0,
  userId: props.userId,
  name: '',
  idNumber: '',
  nationality: '',
  residence: '',
  occupation: '',
  employer: '',
  gender: '',
  birthday: '',
  placeOfBirth: '',
  currentAddress: '',
  incomeSource: '',
  idPhotoUrl: '',
  faceMatchStatus: '',
  faceMatchLogs: [],
});

// Security status - properly typed to match API response
const securityStatus = ref({
  phoneBinding: false,
  googleAuth: false,
  biometricAuth: false,
  keyAuth: false,
});

// Face match logs
const faceMatchLogs = ref<any[]>([]);

// Editing states
const editingField = ref<string | null>(null);
const editingValue = ref('');
const editingDateValue = ref<number | null>(null);

// Options
const nationalityOptions = [
  { label: '中国', value: '中国' },
  { label: '巴西', value: '巴西' },
  { label: '美国', value: '美国' },
  { label: '英国', value: '英国' },
  { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' },
  { label: '其他', value: '其他' },
];

const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
  { label: '其他', value: '其他' },
];

// Computed
const maskedIdNumber = computed(() => {
  if (!profile.value.idNumber) return '--';
  if (showFullIdNumber.value) return profile.value.idNumber;

  const id = profile.value.idNumber;
  if (id.length <= 4) return id;
  return '***' + id.slice(-4);
});

// Methods
const loadProfile = async () => {
  loading.value = true;
  try {
    const response = await getUserProfileApi(props.userId);
    profile.value = response;
  } catch (error) {
    message.error('获取个人资料失败');
    console.error('Error loading profile:', error);
  } finally {
    loading.value = false;
  }
};

const loadSecurityStatus = async () => {
  try {
    const response = await getUserSecurityStatusApi(props.userId);
    // Map API response to UI expected format
    securityStatus.value = {
      phoneBinding: response.isTelephoneNumberSet || false,
      googleAuth: response.isGoogleAuthenticatorSet || false,
      biometricAuth: false, // Not implemented yet in backend
      keyAuth: response.isWithdrawalPasswordSet || false, // Using withdrawal password as "key auth"
    };
  } catch (error) {
    message.error('获取安全状态失败');
    console.error('Error loading security status:', error);
  }
};

const loadFaceMatchLogs = async () => {
  try {
    const response = await getFaceMatchLogsApi(props.userId);
    faceMatchLogs.value = response;
  } catch (error) {
    message.error('获取人脸比对记录失败');
    console.error('Error loading face match logs:', error);
  }
};

const handleEditField = (fieldKey: string) => {
  editingField.value = fieldKey;
  editingValue.value = (profile.value as any)[fieldKey] || '';
};

const handleEditDateField = (fieldKey: string) => {
  editingField.value = fieldKey;
  const dateStr = (profile.value as any)[fieldKey];
  editingDateValue.value = dateStr ? new Date(dateStr).getTime() : null;
};

const handleSaveField = async () => {
  if (!editingField.value) return;

  try {
    const updateParams: UpdateProfileParams = {
      [editingField.value]: editingValue.value,
    };

    await updateUserProfileApi(props.userId, updateParams);
    (profile.value as any)[editingField.value] = editingValue.value;

    editingField.value = null;
    editingValue.value = '';
    message.success('更新成功');
  } catch (error) {
    message.error('更新失败');
    console.error('Error updating profile:', error);
  }
};

const handleSaveDateField = async () => {
  if (!editingField.value || editingDateValue.value === null) return;

  try {
    // Convert timestamp to date string WITHOUT timezone shifts
    const date = new Date(editingDateValue.value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const updateParams: UpdateProfileParams = {
      [editingField.value]: dateStr,
    };

    await updateUserProfileApi(props.userId, updateParams);
    (profile.value as any)[editingField.value] = dateStr;

    editingField.value = null;
    editingDateValue.value = null;
    message.success('更新成功');
  } catch (error) {
    message.error('更新失败');
    console.error('Error updating profile date:', error);
  }
};

const handleCancelEdit = () => {
  editingField.value = null;
  editingValue.value = '';
  editingDateValue.value = null;
};

const toggleIdNumberView = () => {
  showFullIdNumber.value = !showFullIdNumber.value;
};

const handlePhotoUpload = async ({ file }: { file: UploadFileInfo }) => {
  if (!file.file) return;

  try {
    const response = await uploadIdPhotoApi(props.userId, file.file);
    profile.value.idPhotoUrl = response.photoUrl;
    message.success('照片上传成功');
  } catch (error) {
    message.error('照片上传失败');
    console.error('Error uploading photo:', error);
  }
};

const handleProfilePhotoUpload = async ({ file }: { file: UploadFileInfo }) => {
  if (!file.file) return;

  try {
    const response = await uploadIdPhotoApi(props.userId, file.file);
    profile.value.idPhotoUrl = response.photoUrl;
    message.success('头像上传成功');
  } catch (error) {
    message.error('头像上传失败');
    console.error('Error uploading profile photo:', error);
  }
};

const handleSaveAllProfile = async () => {
  try {
    const { id, userId, faceMatchStatus, faceMatchLogs, ...updateParams } =
      profile.value;
    // Fix gender type - convert empty string to undefined
    const params = {
      ...updateParams,
      gender: updateParams.gender === '' ? undefined : updateParams.gender,
    };
    await updateUserProfileApi(props.userId, params);
    message.success('保存成功');
  } catch (error) {
    message.error('保存失败');
    console.error('Error saving profile:', error);
  }
};

const handleRefreshProfile = () => {
  loadProfile();
  loadSecurityStatus();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
};

// Lifecycle
onMounted(() => {
  loadProfile();
  loadSecurityStatus();
  loadFaceMatchLogs();
});
</script>

<style scoped>
.profile-tab {
  padding: 16px;
}

.profile-content {
  min-height: 400px;
}

.profile-fields {
  margin-bottom: 16px;
}

.profile-picture-section {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 24px;
}

.profile-picture-container {
  flex-shrink: 0;
}

.profile-picture-info {
  flex: 1;
}

.profile-photo-preview {
  text-align: center;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.field-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  min-height: 32px;
}

.field-value span {
  flex: 1;
  padding: 6px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.security-status {
  margin-bottom: 16px;
}

.security-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.security-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.face-match-logs {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  border: 1px solid #e0e0e0;
}

.photo-preview {
  text-align: center;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 8px;
}

.h-96 {
  height: 24rem;
}

.cursor-pointer {
  cursor: pointer;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}

.p-3 {
  padding: 0.75rem;
}

.border {
  border-width: 1px;
}

.rounded {
  border-radius: 0.25rem;
}

.font-medium {
  font-weight: 500;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.mt-1 {
  margin-top: 0.25rem;
}

.max-w-full {
  max-width: 100%;
}

.max-h-96 {
  max-height: 24rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
