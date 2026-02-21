<template>
  <div class="h-full bg-gray-50 p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="mb-2 text-2xl font-semibold text-gray-900">个性化配置</h1>
      <p class="text-gray-600">自定义您的应用外观和布局设置</p>
    </div>

    <!-- Main Content -->
    <div class="flex min-h-[calc(100vh-140px)] gap-6">
      <!-- Left Panel - Configuration -->
      <div class="flex-1 rounded-lg border bg-white shadow-sm">
        <n-tabs v-model:value="activeTab" type="line">
          <!-- Tab 1: 版本个性化 -->
          <n-tab-pane name="version" tab="版本个性化">
            <div class="space-y-8 p-6">
              <!-- Current Skin Style -->
              <div class="mb-8 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    显示当前皮肤样式名称
                  </h3>
                  <p class="mt-1 font-medium text-blue-600">
                    {{ currentSkinName }}
                  </p>
                  <div class="mt-2 space-y-1">
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">皮肤样式:</span>
                      {{ brandSkinInfo?.skinStyle || '未设置' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">皮肤颜色:</span>
                      {{ brandSkinInfo?.colorName || '未设置' }}
                    </p>
                  </div>
                </div>
                <n-button
                  v-if="!isEditMode"
                  type="primary"
                  @click="enterEditMode"
                  >修改</n-button
                >
              </div>

              <!-- Banner Style Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  Banner样式
                  <span v-if="!isEditMode">通用Banner</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div
                  v-if="!isEditMode"
                  class="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center"
                >
                  <div
                    class="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <span class="font-medium text-white">Banner样式图</span>
                  </div>
                  <p class="text-sm text-gray-500">通用Banner预览</p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.bannerStyle">
                    <div class="grid grid-cols-4 gap-4">
                      <div class="text-center">
                        <n-radio value="common" class="mb-2">
                          <div
                            class="h-16 w-20 rounded border-2 bg-blue-500"
                            :class="
                              layoutConfig.bannerStyle === 'common'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            "
                          >
                            <div class="p-1 text-xs text-white">Banner样式</div>
                          </div>
                        </n-radio>
                        <p class="text-xs">通用Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="small" class="mb-2">
                          <div
                            class="h-12 w-20 rounded border-2 bg-blue-400"
                            :class="
                              layoutConfig.bannerStyle === 'small'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            "
                          ></div>
                        </n-radio>
                        <p class="text-xs">小Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="scroll" class="mb-2">
                          <div
                            class="h-16 w-20 rounded border-2 bg-blue-600"
                            :class="
                              layoutConfig.bannerStyle === 'scroll'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            "
                          ></div>
                        </n-radio>
                        <p class="text-xs">滚播Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="large" class="mb-2">
                          <div
                            class="h-20 w-20 rounded border-2 bg-blue-700"
                            :class="
                              layoutConfig.bannerStyle === 'large'
                                ? 'border-blue-500'
                                : 'border-gray-300'
                            "
                          ></div>
                        </n-radio>
                        <p class="text-xs">大Banner</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- My Page Style Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  我的页面样式
                  <span v-if="!isEditMode">样式1</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div
                    class="relative mx-auto h-80 w-40 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100"
                  >
                    <!-- Mobile Screen Preview -->
                    <div
                      class="absolute left-0 top-0 h-8 w-full bg-gradient-to-r from-blue-500 to-purple-600"
                    ></div>
                    <div class="space-y-2 p-3 pt-8">
                      <div class="mb-2 h-3 rounded bg-gray-300"></div>
                      <div class="grid grid-cols-3 gap-1">
                        <div class="h-8 rounded bg-blue-200"></div>
                        <div class="h-8 rounded bg-green-200"></div>
                        <div class="h-8 rounded bg-red-200"></div>
                      </div>
                      <div class="mt-4 space-y-1">
                        <div class="h-2 rounded bg-gray-200"></div>
                        <div class="h-2 w-3/4 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    我的页面预览
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.myPageStyle">
                    <div class="grid grid-cols-5 gap-3">
                      <div v-for="i in 5" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div
                            class="relative h-28 w-16 overflow-hidden rounded border-2 bg-white"
                            :class="
                              layoutConfig.myPageStyle === `style${i}`
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div
                              class="absolute top-0 h-3 w-full"
                              :class="`bg-gradient-to-r ${i === 1 ? 'from-blue-500 to-purple-600' : i === 2 ? 'from-green-500 to-blue-500' : i === 3 ? 'from-red-500 to-pink-500' : i === 4 ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-indigo-500'}`"
                            ></div>
                            <div class="space-y-1 p-1 pt-3">
                              <div class="h-1 rounded bg-gray-300"></div>
                              <div class="grid grid-cols-3 gap-px">
                                <div class="h-2 rounded bg-gray-200"></div>
                                <div class="h-2 rounded bg-gray-200"></div>
                                <div class="h-2 rounded bg-gray-200"></div>
                              </div>
                              <div class="space-y-px">
                                <div class="h-px bg-gray-200"></div>
                                <div class="h-px w-3/4 bg-gray-200"></div>
                              </div>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">样式{{ i }}</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Self-operated Promotion Toggle -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <div class="mb-4 flex items-center justify-between">
                  <h4 class="text-md font-medium text-gray-900">
                    是否开启自营宣传
                  </h4>
                  <n-switch
                    v-model:value="selfPromotionEnabled"
                    @update:value="handleSelfPromotionToggle"
                  >
                    <template #checked>开启</template>
                    <template #unchecked>关闭</template>
                  </n-switch>
                </div>

                <!-- Self-promotion Banner Preview (when enabled) -->
                <div
                  v-if="selfPromotionEnabled"
                  class="mt-4 rounded-lg border bg-white p-4"
                >
                  <div
                    class="flex h-24 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-blue-500"
                  >
                    <span class="font-medium text-white">自营Banner预览</span>
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    自营宣传横幅
                  </p>
                </div>
              </div>

              <!-- Game Card Icons Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  游戏卡片图标
                  <span v-if="!isEditMode">欧规版</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div class="flex items-center justify-center">
                    <div
                      class="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                    >
                      <span class="text-sm font-bold text-white">PG</span>
                    </div>
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    示例游戏图标
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.gameCardIcon">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="text-center">
                        <n-radio value="european" class="mb-2">
                          <div
                            class="rounded border-2 bg-white p-4"
                            :class="
                              layoutConfig.gameCardIcon === 'european'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div
                              class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"
                            >
                              <span class="font-bold text-white">WG</span>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">欧风版</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="classic" class="mb-2">
                          <div
                            class="rounded border-2 bg-white p-4"
                            :class="
                              layoutConfig.gameCardIcon === 'classic'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div
                              class="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500"
                            >
                              <span class="font-bold text-white">WG</span>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">经典版</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Popup Style Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  弹窗样式
                  <span v-if="!isEditMode">样式2</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div
                    class="relative flex h-40 w-full items-center justify-center rounded-lg border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200"
                  >
                    <div
                      class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400"
                    >
                      <span class="text-xs text-white">×</span>
                    </div>
                    <div class="text-center">
                      <div
                        class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500"
                      >
                        <span class="text-white">!</span>
                      </div>
                      <p class="text-sm text-gray-600">弹窗样式预览</p>
                    </div>
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    弹窗布局样式
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.popupStyle">
                    <div class="grid grid-cols-4 gap-3">
                      <div v-for="i in 4" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div
                            class="relative h-16 w-20 rounded border-2 bg-white"
                            :class="
                              layoutConfig.popupStyle === `style${i}`
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div
                              class="absolute right-1 top-1 h-2 w-2 rounded-full bg-gray-400"
                            ></div>
                            <div
                              class="flex h-full items-center justify-center"
                            >
                              <div
                                class="mx-auto h-4 w-4 rounded-full"
                                :class="
                                  i === 1
                                    ? 'bg-blue-500'
                                    : i === 2
                                      ? 'bg-green-500'
                                      : i === 3
                                        ? 'bg-red-500'
                                        : 'bg-purple-500'
                                "
                              ></div>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">样式{{ i }}</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Page Turn Style Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  翻页样式
                  <span v-if="!isEditMode">手动加载</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div class="space-y-2 text-center">
                    <p class="text-sm text-gray-600">正在加载...</p>
                    <p class="text-xs text-gray-500">
                      请于浏览器上滑动中控12楼
                    </p>
                    <div class="mt-4 border-t pt-2">
                      <p
                        class="flex items-center justify-center gap-1 text-sm text-blue-600"
                      >
                        加载更多
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.pageStyle">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="text-center">
                        <n-radio value="auto" class="mb-2">
                          <div
                            class="rounded border-2 bg-white p-4"
                            :class="
                              layoutConfig.pageStyle === 'auto'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div class="space-y-1 text-center">
                              <div class="text-xs text-gray-600">
                                自动加载中...
                              </div>
                              <div
                                class="mx-auto h-1 w-4 animate-pulse rounded bg-blue-500"
                              ></div>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">自动加载</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="manual" class="mb-2">
                          <div
                            class="rounded border-2 bg-white p-4"
                            :class="
                              layoutConfig.pageStyle === 'manual'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div class="space-y-1 text-center">
                              <div class="text-xs text-blue-600">手动翻页</div>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">手动翻页</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Lobby Button Style Section -->
              <div class="rounded-lg border bg-gray-50 p-6">
                <h4 class="text-md mb-4 font-medium text-gray-900">
                  Lobby按钮样式
                  <span v-if="!isEditMode">样式1</span>
                  <span v-if="isEditMode" class="ml-2 text-blue-500">✓</span>
                </h4>

                <!-- View Mode -->
                <div v-if="!isEditMode" class="rounded-lg border bg-white p-4">
                  <div class="flex items-center justify-center">
                    <div class="text-center">
                      <div
                        class="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                      >
                        <span class="text-lg text-white">🏠</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700">首页</p>
                    </div>
                  </div>
                  <p class="mt-2 text-center text-sm text-gray-500">
                    Lobby按钮预览
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.lobbyButtonStyle">
                    <div
                      class="grid max-h-60 grid-cols-5 gap-2 overflow-y-auto"
                    >
                      <div v-for="i in 10" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div
                            class="rounded border-2 bg-white p-2"
                            :class="
                              layoutConfig.lobbyButtonStyle === `style${i}`
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            "
                          >
                            <div
                              class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full text-xs text-white"
                              :class="
                                i === 1
                                  ? 'bg-blue-500'
                                  : i === 2
                                    ? 'bg-gray-500'
                                    : i === 3
                                      ? 'bg-gray-600'
                                      : i === 4
                                        ? 'bg-black'
                                        : i === 5
                                          ? 'bg-gray-400'
                                          : i === 6
                                            ? 'bg-gray-700'
                                            : i === 7
                                              ? 'bg-yellow-500'
                                              : i === 8
                                                ? 'bg-black'
                                                : i === 9
                                                  ? 'bg-blue-600'
                                                  : 'bg-gray-800'
                              "
                            >
                              🏠
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">样式{{ i }}</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- Edit Mode Action Buttons -->
              <div
                v-if="isEditMode"
                class="flex justify-center space-x-4 border-t pt-6"
              >
                <n-button @click="cancelEdit" size="large">取消</n-button>
                <n-button
                  type="primary"
                  @click="
                    () => {
                      console.log('🔘 Save button clicked!');
                      saveConfig();
                    }
                  "
                  size="large"
                  >保存</n-button
                >
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 2: 按钮配置 -->
          <n-tab-pane name="buttons" tab="按钮配置">
            <div class="space-y-6 p-6">
              <!-- Header with Edit Button -->
              <div class="mb-6 flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">底部导航</h3>
                  <p class="text-sm text-gray-600">配置底部导航按钮</p>
                </div>
                <div class="flex space-x-3">
                  <n-button
                    v-if="!isButtonEditMode"
                    @click="showIconUploadModal = true"
                    >上传图标</n-button
                  >
                  <n-button
                    v-if="!isButtonEditMode"
                    type="primary"
                    @click="enterButtonEditMode"
                    >修改</n-button
                  >
                </div>
              </div>

              <!-- Button Configuration Sections -->
              <div v-if="isButtonEditMode" class="space-y-8">
                <!-- 登录前 Section -->
                <div class="rounded-lg border bg-gray-50 p-6">
                  <h4 class="text-md mb-4 font-medium text-gray-900">登入前</h4>
                  <div class="grid grid-cols-5 place-items-center gap-4">
                    <div
                      v-for="(button, index) in buttonConfig.beforeLogin"
                      :key="index"
                      class="text-center"
                    >
                      <div
                        class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-400"
                        @click="openIconSelector('beforeLogin', index)"
                      >
                        <div v-if="button.icon" class="text-center">
                          <img
                            v-if="getIconImageUrl(button)"
                            :src="getIconImageUrl(button)"
                            :alt="button.label"
                            class="mx-auto mb-1 h-8 w-8 object-contain"
                          />
                          <div v-else class="mb-1 text-2xl">
                            {{ getIconDisplay(button.icon) }}
                          </div>
                          <div class="text-xs text-gray-600">
                            {{ button.label }}
                          </div>
                        </div>
                        <div v-else class="text-2xl text-gray-400">+</div>
                      </div>
                      <p class="mt-2 text-xs text-gray-500">
                        按钮{{ index + 1 }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 登录后 Section -->
                <div class="rounded-lg border bg-gray-50 p-6">
                  <h4 class="text-md mb-4 font-medium text-gray-900">登入后</h4>
                  <div class="grid grid-cols-5 place-items-center gap-4">
                    <div
                      v-for="(button, index) in buttonConfig.afterLogin"
                      :key="index"
                      class="text-center"
                    >
                      <div
                        class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-blue-400"
                        @click="openIconSelector('afterLogin', index)"
                      >
                        <div v-if="button.icon" class="text-center">
                          <img
                            v-if="getIconImageUrl(button)"
                            :src="getIconImageUrl(button)"
                            :alt="button.label"
                            class="mx-auto mb-1 h-8 w-8 object-contain"
                          />
                          <div v-else class="mb-1 text-2xl">
                            {{ getIconDisplay(button.icon) }}
                          </div>
                          <div class="text-xs text-gray-600">
                            {{ button.label }}
                          </div>
                        </div>
                        <div v-else class="text-2xl text-gray-400">+</div>
                      </div>
                      <p class="mt-2 text-xs text-gray-500">
                        按钮{{ index + 1 }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Validation Error -->
                <div
                  v-if="showValidationError"
                  class="text-center text-sm text-red-500"
                >
                  请设置完整按钮再做模板配置
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-center space-x-4 border-t pt-6">
                  <n-button @click="cancelButtonEdit" size="large"
                    >取消</n-button
                  >
                  <n-button @click="generatePreview" size="large"
                    >生成预览</n-button
                  >
                  <n-button
                    type="primary"
                    @click="saveButtonConfig"
                    size="large"
                    >保存</n-button
                  >
                </div>
              </div>

              <!-- View Mode Display -->
              <div v-if="!isButtonEditMode" class="space-y-8">
                <div class="rounded-lg bg-gray-50 py-12 text-center">
                  <p class="text-gray-500">点击"修改"按钮开始配置底部导航</p>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- Right Panel - Mobile Preview -->
      <div class="w-100 rounded-lg border bg-white p-4 shadow-sm">
        <h3 class="mb-4 text-center text-lg font-medium text-gray-900">
          实时预览
        </h3>

        <!-- Mobile Frame -->
        <div
          class="w-200 mx-auto h-[600px] rounded-[2rem] bg-black p-3 shadow-2xl"
        >
          <div
            class="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-white"
          >
            <!-- Mobile Content Preview -->
            <iframe
              ref="previewIframe"
              :src="previewUrl"
              class="h-full w-full border-0"
              @load="handleIframeLoad"
            >
            </iframe>

            <!-- Fallback Preview Content (when iframe not available) -->
            <div v-if="!previewUrl" class="h-full w-full overflow-y-auto">
              <!-- Top Banner -->
              <div
                class="flex h-20 items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 px-4"
              >
                <div class="text-lg font-bold text-white">JACKPOT</div>
                <div class="flex gap-2">
                  <button
                    class="rounded bg-white bg-opacity-20 px-3 py-1 text-sm text-white"
                  >
                    登录
                  </button>
                  <button
                    class="rounded bg-white px-3 py-1 text-sm text-blue-600"
                  >
                    注册
                  </button>
                </div>
              </div>

              <!-- Navigation Icons -->
              <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4">
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-red-500"
                  >
                    <span class="text-xs text-white">🎁</span>
                  </div>
                  <span class="text-xs text-gray-600">优惠</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500"
                  >
                    <span class="text-xs text-white">💰</span>
                  </div>
                  <span class="text-xs text-gray-600">充值</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500"
                  >
                    <span class="text-xs text-white">👥</span>
                  </div>
                  <span class="text-xs text-gray-600">代理</span>
                </div>
                <div class="text-center">
                  <div
                    class="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500"
                  >
                    <span class="text-xs text-white">👤</span>
                  </div>
                  <span class="text-xs text-gray-600">我的</span>
                </div>
              </div>

              <!-- Game Cards -->
              <div class="space-y-3 p-4">
                <h4 class="font-medium text-gray-800">热门游戏</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"
                  >
                    <span class="text-sm font-bold text-white">PG</span>
                  </div>
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500"
                  >
                    <span class="text-sm font-bold text-white">捕鱼</span>
                  </div>
                  <div
                    class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500"
                  >
                    <span class="text-sm font-bold text-white">体育</span>
                  </div>
                </div>
              </div>

              <!-- Self-promotion Banner (conditional) -->
              <div v-if="selfPromotionEnabled" class="mx-4 mb-4">
                <div
                  class="flex h-16 items-center justify-center rounded-lg bg-gradient-to-r from-green-400 to-blue-500"
                >
                  <span class="text-sm font-medium text-white"
                    >自营广告横幅</span
                  >
                </div>
              </div>

              <!-- Bottom Navigation -->
              <div
                class="absolute bottom-0 left-0 right-0 h-16 border-t bg-white"
              >
                <div class="flex h-full items-center justify-around px-2">
                  <div
                    v-for="(button, index) in getActiveButtons()"
                    :key="index"
                    class="flex flex-col items-center"
                  >
                    <img
                      v-if="getIconImageUrl(button)"
                      :src="getIconImageUrl(button)"
                      :alt="button.label"
                      class="mx-auto mb-1 h-4 w-4 object-contain"
                    />
                    <div v-else-if="button.icon" class="mb-1 text-xs">
                      {{ getIconDisplay(button.icon) }}
                    </div>
                    <div v-else class="mb-1 h-6 w-6 rounded bg-gray-200"></div>
                    <span class="text-xs text-gray-600">{{
                      button.label || '按钮'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Info -->
      </div>
    </div>

    <!-- Edit Skin Name Modal -->
    <n-modal
      v-model:show="showEditModal"
      preset="dialog"
      title="修改皮肤样式名称"
    >
      <div class="space-y-4">
        <n-form>
          <n-form-item label="样式名称">
            <n-input
              v-model:value="editingSkinName"
              placeholder="请输入皮肤样式名称"
            />
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <n-space>
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="saveSkinName">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Icon Selector Modal -->
    <n-modal
      v-model:show="iconSelectorShow"
      preset="card"
      title="选择图标"
      style="width: 600px; max-height: 70vh"
    >
      <div class="max-h-96 overflow-y-auto">
        <div class="grid grid-cols-6 gap-4 p-4">
          <div
            v-for="iconItem in availableIcons"
            :key="iconItem.key"
            class="cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-blue-400"
            :class="
              selectedIcon === iconItem.key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            "
            @click="selectIcon(iconItem.key)"
          >
            <img
              v-if="iconItem.imageUrl"
              :src="iconItem.imageUrl"
              :alt="iconItem.label"
              class="mx-auto mb-2 h-8 w-8 object-contain"
            />
            <div v-else class="mb-2 text-2xl">{{ iconItem.display }}</div>
            <div class="text-xs text-gray-600">{{ iconItem.label }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="iconSelectorShow = false">取消</n-button>
          <n-button type="primary" @click="confirmIconSelection">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Icon Upload Modal -->
    <n-modal
      v-model:show="showIconUploadModal"
      preset="card"
      title="上传图标"
      style="width: 500px"
    >
      <div class="space-y-4">
        <n-form>
          <n-form-item label="图标标识">
            <n-input
              v-model:value="uploadForm.iconKey"
              placeholder="例如: home, promotion"
            />
          </n-form-item>
          <n-form-item label="图标名称">
            <n-input
              v-model:value="uploadForm.iconLabel"
              placeholder="例如: 首页, 优惠"
            />
          </n-form-item>
          <n-form-item label="分类">
            <n-input
              v-model:value="uploadForm.category"
              placeholder="例如: navigation, action"
            />
          </n-form-item>
          <n-form-item label="图标文件">
            <n-upload
              ref="uploadRef"
              :max="1"
              :show-file-list="true"
              :on-change="handleFileChange"
              accept="*/*"
              :default-upload="false"
            >
              <n-button>选择图片文件</n-button>
            </n-upload>
          </n-form-item>
        </n-form>
        <div v-if="uploadPreview" class="text-center">
          <img
            :src="uploadPreview"
            alt="预览"
            class="mx-auto h-16 w-16 rounded border object-contain"
          />
          <p class="mt-2 text-xs text-gray-500">图标预览</p>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closeUploadModal">取消</n-button>
          <n-button type="primary" @click="uploadIcon" :loading="uploading"
            >上传</n-button
          >
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  NTabs,
  NTabPane,
  NButton,
  NSwitch,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NRadio,
  NRadioGroup,
  NUpload,
  useMessage,
} from 'naive-ui';
import { LayoutDesignApi, PublicLayoutApi } from '../../api/layout-design';
import type {
  LayoutConfig,
  ButtonConfig,
  AvailableIcon,
  BrandSkinConfig,
} from '../../api/layout-design';
import { useSkinColorOptions } from '../../composables/useColorTheme';

// Composables
const message = useMessage();
const { getSkinColorLabel } = useSkinColorOptions();

// Reactive data
const activeTab = ref('version');
const currentSkinName = ref('欧规美规-Rollex样式');
const selfPromotionEnabled = ref(false);
const showEditModal = ref(false);
const editingSkinName = ref('');
const previewIframe = ref<HTMLIFrameElement>();
const isEditMode = ref(false);

// Button configuration state
const isButtonEditMode = ref(false);
const iconSelectorShow = ref(false);
const selectedIcon = ref('');
const currentButtonGroup = ref('');
const currentButtonIndex = ref(0);
const showValidationError = ref(false);

// Icon upload state
const showIconUploadModal = ref(false);
const uploading = ref(false);
const uploadPreview = ref('');
const uploadRef = ref();
const uploadForm = reactive({
  iconKey: '',
  iconLabel: '',
  category: '',
  file: null as File | null,
});

// Layout configuration values
const layoutConfig = reactive({
  bannerStyle: 'common',
  myPageStyle: 'style1',
  gameCardIcon: 'european',
  popupStyle: 'style2',
  pageStyle: 'manual',
  lobbyButtonStyle: 'style1',
});

// Add layoutConfigId to track the current configuration
const layoutConfigId = ref<number | null>(null);

// Button configuration values
const buttonConfig = reactive({
  beforeLogin: [
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
  ],
  afterLogin: [
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
  ],
});

// Available icons list (will be loaded from API)
const availableIcons = ref<
  Array<{
    id: number;
    key: string;
    label: string;
    display: string;
    imageUrl?: string;
    imageType?: string;
    category?: string;
  }>
>([]);

// Backup for cancel functionality
const originalLayoutConfig = ref({});
const originalButtonConfig = ref({});

// Preview URL (can be set to actual preview endpoint when available)
const previewUrl = ref('https://sevenki.118br.com/');

// Brand skin information
const brandSkinInfo = ref<{
  skinStyle: string;
  skinColor: string;
  colorName: string;
} | null>(null);

// Methods
const editSkinName = () => {
  editingSkinName.value = currentSkinName.value;
  showEditModal.value = true;
};

const saveSkinName = () => {
  if (editingSkinName.value.trim()) {
    currentSkinName.value = editingSkinName.value.trim();
    showEditModal.value = false;
    message.success('皮肤样式名称已更新');
  } else {
    message.error('请输入有效的样式名称');
  }
};

const enterEditMode = () => {
  // Backup current config for cancel functionality
  originalLayoutConfig.value = { ...layoutConfig };
  isEditMode.value = true;
  message.info('进入编辑模式');
};

const cancelEdit = () => {
  // Restore original config
  Object.assign(layoutConfig, originalLayoutConfig.value);
  isEditMode.value = false;
  message.info('已取消编辑');
};

const saveConfig = async () => {
  try {
    console.log('🔄 saveConfig called - starting save process...');
    await saveLayoutConfig();
    updatePreview();
    console.log('✅ saveConfig completed successfully');
  } catch (error) {
    console.error('❌ Error saving config:', error);
    message.error('保存失败，请重试');
  }
};

const handleSelfPromotionToggle = (value: boolean) => {
  selfPromotionEnabled.value = value;
  message.info(`自营宣传已${value ? '开启' : '关闭'}`);

  // Update preview when toggle changes
  updatePreview();
};

const handleIframeLoad = () => {
  console.log('Preview iframe loaded');
};

const updatePreview = () => {
  // This function would normally send updates to the preview iframe
  // For now, it's just updating the reactive data that controls the fallback preview
  console.log('Updating preview with current settings');
};

// Button configuration methods
const enterButtonEditMode = () => {
  // Backup current config for cancel functionality
  originalButtonConfig.value = JSON.parse(JSON.stringify(buttonConfig));
  isButtonEditMode.value = true;
  showValidationError.value = false;
  message.info('进入按钮编辑模式');
};

const cancelButtonEdit = () => {
  // Restore original config
  Object.assign(buttonConfig, originalButtonConfig.value);
  isButtonEditMode.value = false;
  showValidationError.value = false;
  message.info('已取消编辑');
};

const openIconSelector = (group: string, index: number) => {
  currentButtonGroup.value = group;
  currentButtonIndex.value = index;
  selectedIcon.value = '';
  iconSelectorShow.value = true;
};

const selectIcon = (iconKey: string) => {
  selectedIcon.value = iconKey;
};

const confirmIconSelection = () => {
  if (selectedIcon.value) {
    const iconData = availableIcons.value.find(
      (icon) => icon.key === selectedIcon.value,
    );
    if (iconData) {
      // Clear the same icon from other buttons in the same group
      if (currentButtonGroup.value === 'beforeLogin') {
        // Clear the same icon from other beforeLogin buttons
        buttonConfig.beforeLogin.forEach((btn, idx) => {
          if (idx !== currentButtonIndex.value && btn.icon === iconData.key) {
            btn.icon = '';
            btn.label = '';
          }
        });

        // Set the icon for the current button
        buttonConfig.beforeLogin[currentButtonIndex.value] = {
          icon: iconData.key,
          label: iconData.label,
          imageUrl: iconData.imageUrl,
        };
      } else {
        // Clear the same icon from other afterLogin buttons
        buttonConfig.afterLogin.forEach((btn, idx) => {
          if (idx !== currentButtonIndex.value && btn.icon === iconData.key) {
            btn.icon = '';
            btn.label = '';
          }
        });

        // Set the icon for the current button
        buttonConfig.afterLogin[currentButtonIndex.value] = {
          icon: iconData.key,
          label: iconData.label,
          imageUrl: iconData.imageUrl,
        };
      }
    }
  }
  iconSelectorShow.value = false;
  showValidationError.value = false;

  // Update preview in real-time
  updatePreview();
};

const getIconDisplay = (iconKey: string) => {
  const iconData = availableIcons.value.find((icon) => icon.key === iconKey);
  return iconData ? iconData.display : '';
};

const getIconImageUrl = (
  iconKeyOrButton: string | { icon: string; imageUrl?: string },
) => {
  // If it's a button object with imageUrl, use it directly
  if (typeof iconKeyOrButton === 'object' && iconKeyOrButton.imageUrl) {
    return iconKeyOrButton.imageUrl;
  }

  // Otherwise, look up by iconKey in available icons
  const iconKey =
    typeof iconKeyOrButton === 'string'
      ? iconKeyOrButton
      : iconKeyOrButton.icon;
  const iconData = availableIcons.value.find((icon) => icon.key === iconKey);
  return iconData ? iconData.imageUrl : '';
};

const validateButtonConfig = () => {
  const beforeLoginValid = buttonConfig.beforeLogin.every(
    (btn) => btn.icon && btn.label,
  );
  const afterLoginValid = buttonConfig.afterLogin.every(
    (btn) => btn.icon && btn.label,
  );
  return beforeLoginValid && afterLoginValid;
};

const generatePreview = () => {
  updatePreview();
  message.success('预览已更新');
};

const saveButtonConfig = async () => {
  if (!validateButtonConfig()) {
    showValidationError.value = true;
    message.error('请设置完整按钮再做模板配置');
    return;
  }

  try {
    await saveLayoutConfig();
    showValidationError.value = false;
    updatePreview();
  } catch (error) {
    console.error('Error saving button config:', error);
    message.error('保存失败，请重试');
  }
};

// Helper methods
const getActiveButtons = () => {
  // Return the appropriate button set based on login state
  // For preview purposes, we'll show beforeLogin buttons by default
  // In a real app, this would depend on user authentication state
  const hasConfiguredButtons = buttonConfig.beforeLogin.some((btn) => btn.icon);
  return hasConfiguredButtons
    ? buttonConfig.beforeLogin
    : [
        { icon: 'home', label: '首页' },
        { icon: 'promotion', label: '优惠' },
        { icon: 'deposit', label: '充值' },
        { icon: 'service', label: '客服' },
        { icon: 'profile', label: '我的' },
      ];
};

// Icon Upload Functions
const handleFileChange = (data: any) => {
  console.log('File change event:', data);

  if (data && data.fileList && data.fileList.length > 0) {
    const file = data.fileList[0].file;
    console.log('Selected file:', file);

    if (file && (file instanceof File || file instanceof Blob)) {
      uploadForm.file = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Invalid file object:', file);
      message.error('文件对象无效');
    }
  } else {
    // No files selected - clear preview and form
    console.log('No files selected - clearing preview');
    uploadForm.file = null;
    uploadPreview.value = '';
  }
};

const uploadIcon = async () => {
  console.log('Upload attempt:', {
    iconKey: uploadForm.iconKey,
    iconLabel: uploadForm.iconLabel,
    file: uploadForm.file
      ? {
          name: uploadForm.file.name,
          size: uploadForm.file.size,
          type: uploadForm.file.type,
        }
      : null,
  });

  if (!uploadForm.iconKey || !uploadForm.iconLabel || !uploadForm.file) {
    message.error('请填写完整信息并选择图片文件');
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('iconImage', uploadForm.file);
    formData.append('iconKey', uploadForm.iconKey);
    formData.append('iconLabel', uploadForm.iconLabel);
    if (uploadForm.category) {
      formData.append('category', uploadForm.category);
    }

    const response = await LayoutDesignApi.uploadIcon(formData);

    if (response.success) {
      message.success('图标上传成功');
      await loadAvailableIcons(); // Reload icons list
      closeUploadModal();
    } else {
      message.error(response.message || '上传失败');
    }
  } catch (error) {
    console.error('Upload error:', error);
    message.error('上传失败，请重试');
  } finally {
    uploading.value = false;
  }
};

const closeUploadModal = () => {
  showIconUploadModal.value = false;
  uploadForm.iconKey = '';
  uploadForm.iconLabel = '';
  uploadForm.category = '';
  uploadForm.file = null;
  uploadPreview.value = '';
  if (uploadRef.value) {
    uploadRef.value.clear();
  }
};

// API Functions
const loadAvailableIcons = async () => {
  try {
    const response = await LayoutDesignApi.getAvailableIcons();
    if (response.success) {
      availableIcons.value = response.data.map((icon) => ({
        id: icon.id,
        key: icon.iconKey,
        label: icon.iconLabel,
        display: icon.iconDisplay || '🔲', // Fallback for old records
        imageUrl: icon.imageUrl,
        imageType: icon.imageType,
        category: icon.category,
      }));
    }
  } catch (error) {
    console.error('Failed to load available icons:', error);
    message.error('加载图标失败');
  }
};

// Load brand skin configuration
const loadBrandSkinConfig = async () => {
  try {
    console.log('🎨 Loading brand skin configuration...');

    // Get layout theme which includes brand skin config
    const response = await PublicLayoutApi.getLayoutTheme();

    if (response.success && response.data?.brandSkin) {
      const brandSkin = response.data.brandSkin;

      console.log('🎨 Found brand skin config:', brandSkin);

      // Get the color name using the color ID
      const colorName = getSkinColorLabel(brandSkin.skinColor) || '未知颜色';

      brandSkinInfo.value = {
        skinStyle: brandSkin.skinStyle || '未设置',
        skinColor: brandSkin.skinColor || '未设置',
        colorName: colorName,
      };

      console.log('✅ Brand skin info loaded:', brandSkinInfo.value);
    } else {
      console.log('ℹ️ No brand skin configuration found');
      brandSkinInfo.value = null;
    }
  } catch (error) {
    console.error('Failed to load brand skin configuration:', error);
    // Don't show error message as this is not critical
  }
};

// Load existing layout configuration
const loadExistingConfig = async () => {
  try {
    console.log('🔍 Loading existing layout configuration...');

    // Get the first (and should be only) layout configuration
    const response = await LayoutDesignApi.getLayoutConfigs();

    if (response.success && response.data?.configs?.length > 0) {
      const existingConfig = response.data.configs[0]; // Get the first/main config
      layoutConfigId.value = existingConfig.id;

      console.log(' Found existing config:', existingConfig);

      // Populate the form with existing data
      currentSkinName.value = existingConfig.skinName || '欧规美规-Rollex样式';
      selfPromotionEnabled.value = existingConfig.selfPromotionEnabled || false;

      // Update layout configuration
      Object.assign(layoutConfig, {
        bannerStyle: existingConfig.bannerStyle || 'common',
        myPageStyle: existingConfig.myPageStyle || 'style1',
        gameCardIcon: existingConfig.gameCardIcon || 'european',
        popupStyle: existingConfig.popupStyle || 'style2',
        pageStyle: existingConfig.pageStyle || 'manual',
        lobbyButtonStyle: existingConfig.lobbyButtonStyle || 'style1',
      });

      // Update button configuration if available
      if (
        existingConfig.buttonConfigs &&
        Array.isArray(existingConfig.buttonConfigs)
      ) {
        console.log(
          ' Processing button configs array:',
          existingConfig.buttonConfigs,
        );

        // Transform array format to grouped format
        const beforeLogin = Array.from({ length: 5 }, () => ({
          icon: '',
          label: '',
          imageUrl: '',
        }));
        const afterLogin = Array.from({ length: 5 }, () => ({
          icon: '',
          label: '',
          imageUrl: '',
        }));

        existingConfig.buttonConfigs.forEach((btn: any) => {
          const buttonData = {
            icon: btn.iconKey || '',
            label: btn.iconLabel || '',
            imageUrl: btn.imageUrl || '',
          };

          console.log(
            `🔘 Processing button: ${btn.buttonGroup}[${btn.buttonIndex}] = ${btn.iconKey} (${btn.imageUrl})`,
          );

          if (
            btn.buttonGroup === 'beforeLogin' &&
            btn.buttonIndex >= 0 &&
            btn.buttonIndex < 5
          ) {
            beforeLogin[btn.buttonIndex] = buttonData;
          } else if (
            btn.buttonGroup === 'afterLogin' &&
            btn.buttonIndex >= 0 &&
            btn.buttonIndex < 5
          ) {
            afterLogin[btn.buttonIndex] = buttonData;
          }
        });

        console.log(' Final beforeLogin config:', beforeLogin);
        console.log(' Final afterLogin config:', afterLogin);

        buttonConfig.beforeLogin = beforeLogin;
        buttonConfig.afterLogin = afterLogin;
      } else if (
        existingConfig.buttonConfigs &&
        typeof existingConfig.buttonConfigs === 'object'
      ) {
        // Handle already grouped format (from getLayoutConfig API)
        const { beforeLogin, afterLogin } = existingConfig.buttonConfigs;
        if (beforeLogin) {
          buttonConfig.beforeLogin = beforeLogin;
        }
        if (afterLogin) {
          buttonConfig.afterLogin = afterLogin;
        }
      }

      console.log('✅ Layout configuration loaded successfully');
    } else {
      console.log(
        'ℹ️ No existing configuration found, will create new one on first save',
      );
    }
  } catch (error) {
    console.error('Failed to load existing configuration:', error);
    // Don't show error message as this is not critical - we can still create new config
  }
};

const saveLayoutConfig = async () => {
  try {
    console.log('📝 saveLayoutConfig - preparing data...');

    const requestData = {
      layoutConfig: {
        skinName: currentSkinName.value,
        bannerStyle: layoutConfig.bannerStyle,
        myPageStyle: layoutConfig.myPageStyle,
        gameCardIcon: layoutConfig.gameCardIcon,
        popupStyle: layoutConfig.popupStyle,
        pageStyle: layoutConfig.pageStyle,
        lobbyButtonStyle: layoutConfig.lobbyButtonStyle,
        selfPromotionEnabled: selfPromotionEnabled.value,
      },
      buttonConfig: {
        beforeLogin: buttonConfig.beforeLogin,
        afterLogin: buttonConfig.afterLogin,
      },
    };

    console.log('📤 Sending request data:', requestData);
    console.log('🆔 Current layout config ID:', layoutConfigId.value);

    let response;

    if (layoutConfigId.value) {
      // Update existing configuration
      console.log('🔄 Updating existing layout configuration...');
      response = await LayoutDesignApi.updateLayoutConfig(
        layoutConfigId.value,
        requestData,
      );
    } else {
      // Create new configuration (first time only)
      console.log('🆕 Creating new layout configuration...');
      response = await LayoutDesignApi.createLayoutConfig(requestData);

      // Store the new ID for future updates
      if (response.success && response.data?.id) {
        layoutConfigId.value = response.data.id;
        console.log('💾 Stored new layout config ID:', layoutConfigId.value);
      }
    }

    console.log('📥 Received response:', response);

    if (response.success) {
      console.log('✅ Layout config saved successfully!');
      message.success('布局配置保存成功');
      isEditMode.value = false;
      isButtonEditMode.value = false;
    } else {
      console.error('❌ Save failed - response not successful:', response);
      message.error('保存失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('❌ Failed to save layout config:', error);
    message.error('保存失败，请重试');
  }
};

// Initialize data on component mount
onMounted(async () => {
  console.log('🚀 LayoutDesign component mounted');
  await Promise.all([
    loadAvailableIcons(),
    loadExistingConfig(),
    loadBrandSkinConfig(), // Load brand skin config on mount
  ]);
  console.log(' All configuration data loaded, ready for user interaction');
});

// Computed properties
const previewSettings = computed(() => ({
  skinName: currentSkinName.value,
  selfPromotion: selfPromotionEnabled.value,
  buttonConfig: buttonConfig,
  // Add other style settings as needed
}));

// Add computed properties for display names
const bannerStyleDisplayName = computed(() => {
  const styleMap: Record<string, string> = {
    common: '通用Banner',
    small: '小Banner',
    scroll: '滚动Banner',
    large: '大Banner',
  };
  return styleMap[layoutConfig.bannerStyle] || layoutConfig.bannerStyle;
});

const myPageStyleDisplayName = computed(() => {
  const styleNumber = layoutConfig.myPageStyle.replace('style', '');
  return `样式${styleNumber}`;
});

const gameCardIconDisplayName = computed(() => {
  const iconMap: Record<string, string> = {
    european: '欧规版',
    classic: '经典版',
  };
  return iconMap[layoutConfig.gameCardIcon] || layoutConfig.gameCardIcon;
});

const popupStyleDisplayName = computed(() => {
  const styleNumber = layoutConfig.popupStyle.replace('style', '');
  return `样式${styleNumber}`;
});

const pageStyleDisplayName = computed(() => {
  const styleMap: Record<string, string> = {
    auto: '自动加载',
    manual: '手动加载',
  };
  return styleMap[layoutConfig.pageStyle] || layoutConfig.pageStyle;
});

const lobbyButtonStyleDisplayName = computed(() => {
  const styleNumber = layoutConfig.lobbyButtonStyle.replace('style', '');
  return `样式${styleNumber}`;
});
</script>

<style scoped>
/* Custom styles for the layout design page */
.n-tabs :deep(.n-tabs-nav) {
  background-color: #f8fafc;
  border-radius: 0.5rem 0.5rem 0 0;
}

.n-tabs :deep(.n-tabs-tab) {
  font-weight: 500;
}

.n-tabs :deep(.n-tabs-tab--active) {
  background-color: white;
  color: #2563eb;
}

/* Mobile frame styling */
.mobile-frame {
  background: linear-gradient(145deg, #1f1f1f, #2c2c2c);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

/* Scrollbar styling for preview content */
.overflow-y-auto::-webkit-scrollbar {
  width: 2px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
}

/* Animation for toggle changes */
.transition-all {
  transition: all 0.3s ease;
}
</style>
