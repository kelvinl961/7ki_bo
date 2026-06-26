<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="isEditing ? $t('vip.editVipLevel') : $t('vip.addVipLevel')"
    :style="{ width: '900px' }"
    :closable="false"
    :mask-closable="false"
  >
    <div class="vip-level-form-modal">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="140px"
        require-mark-placement="right-hanging"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.basicInfo') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.vipLevelLabel') }}</label>
              <n-input-number
                v-model:value="formData.level"
                :min="0"
                :max="100"
                placeholder="0"
                class="form-input"
                :disabled="true"
              />
              <small class="mt-1 text-gray-500">{{ $t('vip.autoIncrementHint') }}</small>
            </div>

            <div class="form-item">
              <label>{{ $t('vip.levelNameLabel') }}</label>
              <n-input
                v-model:value="formData.name"
                :placeholder="$t('vip.enterLevelName')"
                class="form-input"
              />
            </div>

            <div class="form-item vip-icon-settings-item">
              <label>{{ $t('vip.vipIconSettings') }}</label>
              <div class="vip-icon-settings">
                <div class="icon-settings-layout">
                  <!-- Left side: VIP颜色 and 等级样式 -->
                  <div class="icon-selection-left">
                    <!-- VIP颜色选择 -->
                    <div class="icon-section">
                      <h4 class="icon-section-title">{{ $t('vip.vipColor') }}</h4>
                      <div class="icon-options">
                        <div
                          v-for="color in vipColors"
                          :key="color.id"
                          class="icon-option"
                          :class="{ active: formData.color === color.image }"
                          @click="selectColor(color.id)"
                        >
                          <img
                            :src="color.image"
                            :alt="color.name"
                            class="color-icon"
                            @error="handleImageError"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- 等级样式选择 -->
                    <div class="icon-section">
                      <h4 class="icon-section-title">{{ $t('vip.levelStyle') }}</h4>
                      <div class="icon-options">
                        <div
                          class="icon-option clear-option"
                          :class="{ active: formData.vipStyle === '' }"
                          @click="selectStyle('')"
                          :title="$t('vip.clearStyleSelection')"
                        >
                          <div class="clear-icon">✕</div>
                        </div>
                        <div
                          v-for="style in vipStyles"
                          :key="style.id"
                          class="icon-option"
                          :class="{ active: formData.vipStyle === style.id }"
                          @click="selectStyle(style.id)"
                        >
                          <img
                            :src="style.image"
                            :alt="style.name"
                            class="style-icon"
                            @error="handleImageError"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right side: 图标预览 -->
                  <div class="icon-preview">
                    <h4 class="icon-section-title">{{ $t('vip.iconPreview') }}</h4>
                    <div class="preview-container">
                      <div class="preview-background">
                        <img
                          v-if="getSelectedColor()"
                          :src="getSelectedColor()?.image"
                          :alt="getSelectedColor()?.name"
                          class="preview-color"
                          @error="handlePreviewImageError"
                        />
                        <img
                          v-if="getSelectedStyle()"
                          :src="getSelectedStyle()?.image"
                          :alt="getSelectedStyle()?.name"
                          class="preview-style"
                          @error="handlePreviewImageError"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-item">
              <label>{{ $t('common.currency') }} *</label>
              <n-select
                v-model:value="formData.currency"
                :options="currencyOptions"
                :placeholder="$t('vip.selectCurrency')"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.displayOrder') }}</label>
              <n-input-number
                v-model:value="formData.displayOrder"
                :min="0"
                placeholder="0"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('common.status') }}</label>
              <n-switch v-model:value="formData.isActive" />
              <span
                class="status-text"
                :class="formData.isActive ? 'active' : 'inactive'"
              >
                {{ formData.isActive ? $t('vip.statusEnabled') : $t('vip.statusDisabled') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 晋级条件 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.upgradeConditions') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.requiredDeposit') }}</label>
              <n-input-number
                v-model:value="formData.requiredDeposit"
                :min="0"
                :precision="2"
                placeholder="1000"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.requiredBet') }}</label>
              <n-input-number
                v-model:value="formData.requiredBet"
                :min="0"
                :precision="2"
                placeholder="5000"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 晋级奖金 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.upgradeBonus') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.upgradeBonus') }}</label>
              <n-input-number
                v-model:value="formData.upgradeBonus"
                :min="0"
                :precision="2"
                placeholder="100"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 月俸禄 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.monthlySalary') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.monthlyDeposit') }}</label>
              <n-input-number
                v-model:value="formData.monthlyDepositRequirement"
                :min="0"
                :precision="2"
                placeholder="2000"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.monthlyBet') }}</label>
              <n-input-number
                v-model:value="formData.monthlyBetRequirement"
                :min="0"
                :precision="2"
                placeholder="10000"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.monthlyRebatePercent') }}</label>
              <n-input-number
                v-model:value="formData.monthlyRebate"
                :min="0"
                :max="100"
                :precision="2"
                placeholder="5"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.monthlyLimit') }}</label>
              <n-input-number
                v-model:value="formData.monthlyLimit"
                :min="0"
                :precision="2"
                placeholder="500"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 周俸禄 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.weeklySalary') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.weeklyDeposit') }}</label>
              <n-input-number
                v-model:value="formData.weeklyDepositRequirement"
                :min="0"
                :precision="2"
                placeholder="0.00"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.weeklyBet') }}</label>
              <n-input-number
                v-model:value="formData.weeklyBetRequirement"
                :min="0"
                :precision="2"
                placeholder="0.00"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.weeklyRebate') }}</label>
              <n-input-number
                v-model:value="formData.weeklyTaskValue"
                :min="0"
                :precision="2"
                placeholder="1.00"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.weeklyLimit') }}</label>
              <n-input-number
                v-model:value="formData.weeklyLimit"
                :min="0"
                :precision="2"
                placeholder="0.00"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 日俸禄 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.dailySalary') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.dailyDeposit') }}</label>
              <n-input-number
                v-model:value="formData.dailyDepositRequirement"
                :min="0"
                :precision="2"
                placeholder="500"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.dailyBet') }}</label>
              <n-input-number
                v-model:value="formData.dailyBetRequirement"
                :min="0"
                :precision="2"
                placeholder="2000"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.dailyRebate') }}</label>
              <n-input-number
                v-model:value="formData.dailyTaskValue"
                :min="0"
                :precision="2"
                placeholder="10"
                class="form-input"
              />
            </div>

            <div class="form-item">
              <label>{{ $t('vip.dailyLimit') }}</label>
              <n-input-number
                v-model:value="formData.dailyLimit"
                :min="0"
                :precision="2"
                placeholder="100"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- 生日礼金 -->
        <div class="form-section">
          <h3 class="section-title">{{ $t('vip.birthdayBonus') }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>{{ $t('vip.birthdayBonus') }}</label>
              <n-input-number
                v-model:value="formData.birthdayBonus"
                :min="0"
                :precision="2"
                placeholder="50"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </n-form>
    </div>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">{{ $t('common.cancel') }}</n-button>
        <n-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEditing ? $t('vip.update') : $t('vip.create') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { $t } from '@vben/locales';

import { ref, reactive, computed, watch } from 'vue';
import type { FormInst, FormRules } from 'naive-ui';
import {
  NModal,
  NForm,
  NFormItem,
  NCard,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  NColorPicker,
  NButton,
  NSpace,
  useMessage,
} from 'naive-ui';
import {
  createVIPLevel,
  updateVIPLevel,
  getVIPLevels,
  type VIPLevel,
  type CreateVIPLevelData,
  CURRENCY_OPTIONS,
} from '../../../api/vip';

interface Props {
  show: boolean;
  editingItem: VIPLevel | null;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const message = useMessage();

// 响应式数据
const formRef = ref<FormInst>();
const submitLoading = ref(false);

// 计算属性
const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
});

const isEditing = computed(() => !!props.editingItem);

// 表单数据
const formData = reactive<
  CreateVIPLevelData & {
    id?: number; // Add id field for editing
    monthlyDepositRequirement: number;
    monthlyBetRequirement: number;
    monthlyLimit: number;
    weeklyDepositRequirement: number;
    weeklyBetRequirement: number;
    weeklyLimit: number;
    dailyDepositRequirement: number;
    dailyBetRequirement: number;
    dailyLimit: number;
    birthdayBonus: number;
    vipStyle: string;
  }
>({
  id: undefined, // Will be set when editing
  level: 0,
  name: '',
  color:
    'https://media.cheshi8899.com/media/media-1756084723456-975551315-style_1_vip_color7.avif', // Default to green color
  icon: '', // VIP style icon URL
  vipStyle: '',
  currency: 'BRL',
  requiredDeposit: 0,
  requiredBet: 0,
  upgradeBonus: 0,
  monthlyRebate: 0,
  weeklyTaskValue: 0,
  dailyTaskValue: 0,
  monthlyDepositRequirement: 0,
  monthlyBetRequirement: 0,
  monthlyLimit: 0,
  weeklyDepositRequirement: 0,
  weeklyBetRequirement: 0,
  weeklyLimit: 0,
  dailyDepositRequirement: 0,
  dailyBetRequirement: 0,
  dailyLimit: 0,
  birthdayBonus: 0,
  isActive: true,
  displayOrder: 0,
});

// 选项配置
const currencyOptions = CURRENCY_OPTIONS;

// VIP颜色选项 - 使用实际上传的图片
const vipColors = computed(() => [
  {
    id: 'color1',
    name: $t('vip.colorGold'),
    image:
      'https://media.cheshi8899.com/media/media-1756084724117-248517786-style_1_vip_color2.avif',
  },
  {
    id: 'color2',
    name: $t('vip.colorSilver'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723983-980058730-style_1_vip_color3.avif',
  },
  {
    id: 'color3',
    name: $t('vip.colorBronze'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723850-421767660-style_1_vip_color4.avif',
  },
  {
    id: 'color4',
    name: $t('vip.colorRed'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723734-656919956-style_1_vip_color5.avif',
  },
  {
    id: 'color5',
    name: $t('vip.colorBlue'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723591-416052528-style_1_vip_color6.avif',
  },
  {
    id: 'color6',
    name: $t('vip.colorGreen'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723456-975551315-style_1_vip_color7.avif',
  },
  {
    id: 'color7',
    name: $t('vip.colorPurple'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723321-874400306-style_1_vip_color8.avif',
  },
  {
    id: 'color8',
    name: $t('vip.colorOrange'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723183-411276279-style_1_vip_color9.avif',
  },
  {
    id: 'color9',
    name: $t('vip.colorPink'),
    image:
      'https://media.cheshi8899.com/media/media-1756084723041-541182858-style_1_vip_color10.avif',
  },
  {
    id: 'color10',
    name: $t('vip.colorCyan'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722928-768032392-style_1_vip_style0.avif',
  },
]);

// VIP样式选项 - 使用实际上传的图片
const vipStyles = computed(() => [
  {
    id: 'style1',
    name: $t('vip.style1Star'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722842-582069789-style_1_vip_style1.avif',
  },
  {
    id: 'style2',
    name: $t('vip.style2Star'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722740-802103472-style_1_vip_style2.avif',
  },
  {
    id: 'style3',
    name: $t('vip.style3Star'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722636-333894626-style_1_vip_style3.avif',
  },
  {
    id: 'style4',
    name: $t('vip.style4Star'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722532-886989642-style_1_vip_style4.avif',
  },
  {
    id: 'style5',
    name: $t('vip.style5Star'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722447-561278426-style_1_vip_style5.avif',
  },
  {
    id: 'style6',
    name: $t('vip.style3Diamond'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722361-747879972-style_1_vip_style6.avif',
  },
  {
    id: 'style7',
    name: $t('vip.style5Diamond'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722271-216094122-style_1_vip_style7.avif',
  },
  {
    id: 'style8',
    name: $t('vip.styleCrown1'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722181-225699275-style_1_vip_style8.avif',
  },
  {
    id: 'style9',
    name: $t('vip.styleCrown2'),
    image:
      'https://media.cheshi8899.com/media/media-1756084722063-17229909-style_1_vip_style9.avif',
  },
  {
    id: 'style10',
    name: $t('vip.styleCrown3'),
    image:
      'https://media.cheshi8899.com/media/media-1756084721842-860245261-style_1_vip_style10.avif',
  },
]);

// 选择颜色
function selectColor(colorId: string) {
  // Find the color object and set the actual image URL
  const selectedColor = vipColors.value.find((color) => color.id === colorId);
  if (selectedColor) {
    formData.color = selectedColor.image;
    console.log('🎨 Color selected:', {
      colorId,
      colorUrl: selectedColor.image,
    });
  }
}

// 选择样式
function selectStyle(styleId: string) {
  formData.vipStyle = styleId;

  if (styleId === '' || !styleId) {
    // Clear the icon when no style is selected
    formData.icon = '';
    console.log('🎨 Style cleared - no selection');
  } else {
    // Find the style object and set the actual image URL
    const selectedStyle = vipStyles.value.find((style) => style.id === styleId);
    if (selectedStyle) {
      formData.icon = selectedStyle.image; // Store the actual image URL in the icon field
      console.log('🎨 Style selected:', {
        styleId,
        iconUrl: selectedStyle.image,
      });
    }
  }
}

// 获取选中的样式
function getSelectedStyle() {
  return vipStyles.value.find((style) => style.id === formData.vipStyle);
}

// 获取选中的颜色
function getSelectedColor() {
  return vipColors.value.find((color) => color.image === formData.color);
}

// 处理图片加载错误
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  // 设置默认图片或隐藏图片
  img.style.display = 'none';
}

// 处理预览图片加载错误
function handlePreviewImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  // 设置默认图片或隐藏图片
  img.style.display = 'none';
}

// 获取下一个VIP等级
async function getNextVIPLevel() {
  try {
    console.log('🔄 正在获取VIP等级列表...');
    // 调用API获取最新的VIP等级
    const response = await getVIPLevels({
      pageSize: 100,
      sortBy: 'level',
      sortOrder: 'desc',
    });
    console.log('📊 VIP等级API响应:', response);

    if (response && response.list && response.list.length > 0) {
      // Find the next available level starting from 0
      const existingLevels = (
        response.list ||
        (response as any).data?.list ||
        []
      )
        .map((level: VIPLevel) => level.level)
        .sort((a, b) => a - b);
      let nextLevel = 0;

      // Find the first gap or use max + 1
      for (let i = 0; i < existingLevels.length; i++) {
        if (existingLevels[i] !== nextLevel) {
          break;
        }
        nextLevel++;
      }

      formData.level = nextLevel;
      console.log(`✅ 找到下一个可用等级: ${formData.level}`, {
        existingLevels,
      });
    } else {
      formData.level = 0;
      console.log('✅ 没有现有VIP等级，使用默认等级: 0');
    }
  } catch (error) {
    console.error('❌ 获取VIP等级失败:', error);
    // 如果API调用失败，使用默认值0，不显示错误消息
    formData.level = 0;
    console.log('🔄 使用默认等级: 0');
    // 可以选择不显示错误消息，因为这是自动获取功能
    // message.error('获取VIP等级失败，使用默认等级1');
  }
}

// 表单验证规则
const rules = computed<FormRules>(() => ({
  level: [
    { required: true, message: $t('vip.enterVipLevel'), trigger: 'blur' },
    {
      type: 'number',
      min: 0,
      max: 100,
      message: $t('vip.vipLevelRange'),
      trigger: 'blur',
    },
  ],
  name: [
    { required: true, message: $t('vip.enterLevelName'), trigger: 'blur' },
    {
      min: 1,
      max: 50,
      message: $t('vip.levelNameLength'),
      trigger: 'blur',
    },
  ],
  color: [
    { required: true, message: $t('vip.selectLevelColor'), trigger: 'change' },
  ],
  currency: [
    { required: true, message: $t('vip.selectCurrencyRequired'), trigger: 'change' },
  ],
  requiredDeposit: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.requiredDepositNonNegative'),
      trigger: 'blur',
    },
  ],
  requiredBet: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.requiredBetNonNegative'),
      trigger: 'blur',
    },
  ],
  upgradeBonus: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.upgradeBonusNonNegative'),
      trigger: 'blur',
    },
  ],
  monthlyRebate: [
    {
      type: 'number',
      min: 0,
      max: 100,
      message: $t('vip.monthlyRebateRange'),
      trigger: 'blur',
    },
  ],
  weeklyTaskValue: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.weeklyRebateNonNegative'),
      trigger: 'blur',
    },
  ],
  dailyTaskValue: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.dailyRebateNonNegative'),
      trigger: 'blur',
    },
  ],
  monthlyDepositRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.monthlyDepositNonNegative'),
      trigger: 'blur',
    },
  ],
  monthlyBetRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.monthlyBetNonNegative'),
      trigger: 'blur',
    },
  ],
  monthlyLimit: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.monthlyLimitNonNegative'),
      trigger: 'blur',
    },
  ],
  weeklyDepositRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.weeklyDepositNonNegative'),
      trigger: 'blur',
    },
  ],
  weeklyBetRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.weeklyBetNonNegative'),
      trigger: 'blur',
    },
  ],
  weeklyLimit: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.weeklyLimitNonNegative'),
      trigger: 'blur',
    },
  ],
  dailyDepositRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.dailyDepositNonNegative'),
      trigger: 'blur',
    },
  ],
  dailyBetRequirement: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.dailyBetNonNegative'),
      trigger: 'blur',
    },
  ],
  dailyLimit: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.dailyLimitNonNegative'),
      trigger: 'blur',
    },
  ],
  birthdayBonus: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.birthdayBonusNonNegative'),
      trigger: 'blur',
    },
  ],
  displayOrder: [
    {
      type: 'number',
      min: 0,
      message: $t('vip.displayOrderNonNegative'),
      trigger: 'blur',
    },
  ],
}));

// 监听props变化
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem && props.show) {
      Object.assign(formData, {
        id: newItem.id, // Set the id for editing
        level: newItem.level,
        name: newItem.name,
        color: newItem.color,
        icon: newItem.icon || '',
        currency: newItem.currency,
        requiredDeposit: newItem.requiredDeposit,
        requiredBet: newItem.requiredBet,
        upgradeBonus: newItem.upgradeBonus,
        monthlyRebate: newItem.monthlyRebate,
        weeklyTaskValue: newItem.weeklyTaskValue,
        dailyTaskValue: newItem.dailyTaskValue,
        monthlyDepositRequirement:
          (newItem as any).monthlyDepositRequirement || 0,
        monthlyBetRequirement: (newItem as any).monthlyBetRequirement || 0,
        monthlyLimit: (newItem as any).monthlyLimit || 0,
        weeklyDepositRequirement:
          (newItem as any).weeklyDepositRequirement || 0,
        weeklyBetRequirement: (newItem as any).weeklyBetRequirement || 0,
        weeklyLimit: (newItem as any).weeklyLimit || 0,
        dailyDepositRequirement: (newItem as any).dailyDepositRequirement || 0,
        dailyBetRequirement: (newItem as any).dailyBetRequirement || 0,
        dailyLimit: (newItem as any).dailyLimit || 0,
        birthdayBonus: (newItem as any).birthdayBonus || 0,
        isActive: newItem.isActive,
        displayOrder: newItem.displayOrder,
      });

      console.log('🎨 Initializing VIP form for editing:', {
        itemId: newItem.id,
        color: newItem.color,
        icon: newItem.icon,
        vipStyle: (newItem as any).vipStyle,
        formDataColor: formData.color,
        formDataIcon: formData.icon,
        formDataVipStyle: formData.vipStyle,
      });

      // Initialize vipStyle based on stored icon if vipStyle is not set
      if (newItem.icon && !(newItem as any).vipStyle) {
        const matchingStyle = vipStyles.value.find(
          (style) => style.image === newItem.icon,
        );
        if (matchingStyle) {
          formData.vipStyle = matchingStyle.id;
        }
      } else if ((newItem as any).vipStyle) {
        // Use the stored vipStyle directly
        formData.vipStyle = (newItem as any).vipStyle;
      }
    }
  },
  { immediate: true, deep: true },
);

// 事件处理
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    console.log('🔄 Submitting form data:', formData);
    console.log('📊 Is editing:', isEditing.value);
    console.log('📊 Editing item:', props.editingItem);

    if (isEditing.value) {
      console.log('🔄 Updating VIP level with ID:', props.editingItem!.id);
      await updateVIPLevel(props.editingItem!.id, formData);
      message.success($t('vip.updateLevelSuccess'));
    } else {
      console.log('🔄 Creating new VIP level');
      await createVIPLevel(formData);
      message.success($t('vip.createLevelSuccess'));
    }

    emit('success');
    showModal.value = false;
  } catch (error) {
    if (error instanceof Error) {
      message.error(
        error.message ||
          (isEditing.value
            ? $t('vip.updateLevelFailed')
            : $t('vip.createLevelFailed')),
      );
    } else {
      message.error($t('vip.formValidationFailed'));
    }
    console.error(
      `Error ${isEditing.value ? 'updating' : 'creating'} VIP level:`,
      error,
    );
  } finally {
    submitLoading.value = false;
  }
};

const handleCancel = () => {
  showModal.value = false;
};

// 重置表单
const resetForm = () => {
  formRef.value?.restoreValidation();

  if (props.editingItem) {
    Object.assign(formData, {
      id: props.editingItem.id, // Set the id for editing
      level: props.editingItem.level,
      name: props.editingItem.name,
      color: props.editingItem.color,
      icon: props.editingItem.icon || '',
      currency: props.editingItem.currency,
      requiredDeposit: props.editingItem.requiredDeposit,
      requiredBet: props.editingItem.requiredBet,
      upgradeBonus: props.editingItem.upgradeBonus,
      monthlyRebate: props.editingItem.monthlyRebate,
      dailyTaskValue: props.editingItem.dailyTaskValue,
      monthlyDepositRequirement:
        (props.editingItem as any).monthlyDepositRequirement || 0,
      monthlyBetRequirement:
        (props.editingItem as any).monthlyBetRequirement || 0,
      monthlyLimit: (props.editingItem as any).monthlyLimit || 0,
      weeklyDepositRequirement:
        (props.editingItem as any).weeklyDepositRequirement || 0,
      weeklyBetRequirement:
        (props.editingItem as any).weeklyBetRequirement || 0,
      weeklyLimit: (props.editingItem as any).weeklyLimit || 0,
      dailyDepositRequirement:
        (props.editingItem as any).dailyDepositRequirement || 0,
      dailyBetRequirement: (props.editingItem as any).dailyBetRequirement || 0,
      dailyLimit: (props.editingItem as any).dailyLimit || 0,
      birthdayBonus: (props.editingItem as any).birthdayBonus || 0,
      vipStyle: (props.editingItem as any).vipStyle || '',
      isActive: props.editingItem.isActive,
      displayOrder: props.editingItem.displayOrder,
    });

    // Initialize vipStyle based on stored icon if vipStyle is not set
    if (props.editingItem?.icon && !(props.editingItem as any).vipStyle) {
      const matchingStyle = vipStyles.value.find(
        (style) => style.image === props.editingItem?.icon,
      );
      if (matchingStyle) {
        formData.vipStyle = matchingStyle.id;
      }
    }
  } else {
    Object.assign(formData, {
      level: 0,
      name: '',
      color:
        'https://media.cheshi8899.com/media/media-1756084723456-975551315-style_1_vip_color7.avif', // Default to green color
      icon: '',
      currency: 'BRL',
      requiredDeposit: 0,
      requiredBet: 0,
      upgradeBonus: 0,
      monthlyRebate: 0,
      dailyTaskValue: 0,
      monthlyDepositRequirement: 0,
      monthlyBetRequirement: 0,
      monthlyLimit: 0,
      weeklyDepositRequirement: 0,
      weeklyBetRequirement: 0,
      weeklyLimit: 0,
      dailyDepositRequirement: 0,
      dailyBetRequirement: 0,
      dailyLimit: 0,
      birthdayBonus: 0,
      vipStyle: '',
      isActive: true,
      displayOrder: 0,
    });
  }
};

// 监听弹窗显示状态
watch(showModal, (show) => {
  if (show) {
    if (props.editingItem) {
      resetForm();
    } else {
      // 新增时自动获取下一个等级
      getNextVIPLevel();
    }
  }
});
</script>

<style scoped>
.vip-level-form-modal {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #f9fafb;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-grid .vip-icon-settings-item {
  grid-column: 1 / -1;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
}

.vip-icon-settings {
  margin-top: 16px;
  width: 100%;
}

.vip-icon-settings-item {
  grid-column: 1 / -1;
  width: 100%;
}

.icon-settings-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
  min-height: 300px;
}

.icon-selection-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.icon-section {
  margin-bottom: 0;
}

.icon-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.icon-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.icon-option:hover {
  background-color: #f3f4f6;
}

.icon-option.active {
  background-color: #dbeafe;
  border-color: #3b82f6;
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
}

.icon-option.active .icon-circle {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.color-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: all 0.2s;
}

.style-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: all 0.2s;
}

.icon-option.active .style-icon {
  transform: scale(1.1);
}

.icon-preview {
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 250px;
  position: relative;
  z-index: 1;
}

.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  flex: 1;
  margin-top: 20px;
}

.preview-background {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid #e5e7eb;
}

.preview-color {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.preview-style {
  width: 60px;
  height: 60px;
  object-fit: contain;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.status-text {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-text.active {
  color: #059669;
}

.status-text.inactive {
  color: #dc2626;
}

/* Clear option styling */
.clear-option {
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0 !important;
}

.clear-option:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1 !important;
}

.clear-option.active {
  background-color: #fef2f2 !important;
  border-color: #f87171 !important;
}

.clear-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 4px;
}

.clear-option.active .clear-icon {
  color: #dc2626;
  background-color: #fee2e2;
}

/* 滚动条样式 */
.vip-level-form-modal::-webkit-scrollbar {
  width: 6px;
}

.vip-level-form-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.vip-level-form-modal::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.vip-level-form-modal::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .vip-level-form-modal {
    padding: 16px;
  }

  .form-section {
    padding: 16px;
  }

  .icon-settings-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .icon-preview {
    min-height: 150px;
  }
}
</style>
