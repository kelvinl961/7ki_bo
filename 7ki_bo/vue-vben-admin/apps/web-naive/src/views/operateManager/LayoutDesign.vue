<template>
  <div class="p-6 h-full bg-gray-50">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 mb-2">个性化配置</h1>
      <p class="text-gray-600">自定义您的应用外观和布局设置</p>
    </div>

    <!-- Main Content -->
    <div class="flex gap-6 min-h-[calc(100vh-140px)]">
      <!-- Left Panel - Configuration -->
      <div class="flex-1 bg-white rounded-lg shadow-sm border">
        <n-tabs v-model:value="activeTab" type="line">
          <!-- Tab 1: 版本个性化 -->
          <n-tab-pane name="version" tab="版本个性化">
            <div class="p-6 space-y-8">
                          <!-- Current Skin Style -->
            <div class="flex items-center justify-between mb-8">
              <div>
                <h3 class="text-lg font-medium text-gray-900">显示当前皮肤样式名称</h3>
                <p class="text-blue-600 font-medium mt-1">{{ currentSkinName }}</p>
                <div class="mt-2 space-y-1">
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">皮肤样式:</span> {{ brandSkinInfo?.skinStyle || '未设置' }}
                  </p>
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">皮肤颜色:</span> {{ brandSkinInfo?.colorName || '未设置' }}
                  </p>
                </div>
              </div>
              <n-button v-if="!isEditMode" type="primary" @click="enterEditMode">修改</n-button>
            </div>

              <!-- Banner Style Section -->
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  Banner样式 
                  <span v-if="!isEditMode">通用Banner</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <div class="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                    <span class="text-white font-medium">Banner样式图</span>
                  </div>
                  <p class="text-sm text-gray-500">通用Banner预览</p>
                </div>
                
                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.bannerStyle">
                    <div class="grid grid-cols-4 gap-4">
                      <div class="text-center">
                        <n-radio value="common" class="mb-2">
                          <div class="w-20 h-16 bg-blue-500 rounded border-2" :class="layoutConfig.bannerStyle === 'common' ? 'border-blue-500' : 'border-gray-300'">
                            <div class="text-white text-xs p-1">Banner样式</div>
                          </div>
                        </n-radio>
                        <p class="text-xs">通用Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="small" class="mb-2">
                          <div class="w-20 h-12 bg-blue-400 rounded border-2" :class="layoutConfig.bannerStyle === 'small' ? 'border-blue-500' : 'border-gray-300'"></div>
                        </n-radio>
                        <p class="text-xs">小Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="scroll" class="mb-2">
                          <div class="w-20 h-16 bg-blue-600 rounded border-2" :class="layoutConfig.bannerStyle === 'scroll' ? 'border-blue-500' : 'border-gray-300'"></div>
                        </n-radio>
                        <p class="text-xs">滚播Banner</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="large" class="mb-2">
                          <div class="w-20 h-20 bg-blue-700 rounded border-2" :class="layoutConfig.bannerStyle === 'large' ? 'border-blue-500' : 'border-gray-300'"></div>
                        </n-radio>
                        <p class="text-xs">大Banner</p>
                      </div>
                    </div>
                  </n-radio-group>
                </div>
              </div>

              <!-- My Page Style Section -->
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  我的页面样式 
                  <span v-if="!isEditMode">样式1</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border p-4">
                  <div class="w-40 h-80 bg-gray-100 rounded-lg mx-auto border-2 border-gray-300 relative overflow-hidden">
                    <!-- Mobile Screen Preview -->
                    <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div class="pt-8 p-3 space-y-2">
                      <div class="h-3 bg-gray-300 rounded mb-2"></div>
                      <div class="grid grid-cols-3 gap-1">
                        <div class="h-8 bg-blue-200 rounded"></div>
                        <div class="h-8 bg-green-200 rounded"></div>
                        <div class="h-8 bg-red-200 rounded"></div>
                      </div>
                      <div class="space-y-1 mt-4">
                        <div class="h-2 bg-gray-200 rounded"></div>
                        <div class="h-2 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  <p class="text-center text-sm text-gray-500 mt-2">我的页面预览</p>
                </div>
                
                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.myPageStyle">
                    <div class="grid grid-cols-5 gap-3">
                      <div v-for="i in 5" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div class="w-16 h-28 bg-white rounded border-2 relative overflow-hidden" 
                               :class="layoutConfig.myPageStyle === `style${i}` ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="absolute top-0 w-full h-3" :class="`bg-gradient-to-r ${i === 1 ? 'from-blue-500 to-purple-600' : i === 2 ? 'from-green-500 to-blue-500' : i === 3 ? 'from-red-500 to-pink-500' : i === 4 ? 'from-yellow-500 to-orange-500' : 'from-purple-500 to-indigo-500'}`"></div>
                            <div class="pt-3 p-1 space-y-1">
                              <div class="h-1 bg-gray-300 rounded"></div>
                              <div class="grid grid-cols-3 gap-px">
                                <div class="h-2 bg-gray-200 rounded"></div>
                                <div class="h-2 bg-gray-200 rounded"></div>
                                <div class="h-2 bg-gray-200 rounded"></div>
                              </div>
                              <div class="space-y-px">
                                <div class="h-px bg-gray-200"></div>
                                <div class="h-px bg-gray-200 w-3/4"></div>
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
              <div class="border rounded-lg p-6 bg-gray-50">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-md font-medium text-gray-900">是否开启自营宣传</h4>
                  <n-switch 
                    v-model:value="selfPromotionEnabled" 
                    @update:value="handleSelfPromotionToggle"
                  >
                    <template #checked>开启</template>
                    <template #unchecked>关闭</template>
                  </n-switch>
                </div>
                
                <!-- Self-promotion Banner Preview (when enabled) -->
                <div v-if="selfPromotionEnabled" class="mt-4 p-4 bg-white rounded-lg border">
                  <div class="h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span class="text-white font-medium">自营Banner预览</span>
                  </div>
                  <p class="text-center text-sm text-gray-500 mt-2">自营宣传横幅</p>
                </div>
              </div>

              <!-- Game Card Icons Section -->
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  游戏卡片图标 
                  <span v-if="!isEditMode">欧规版</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border p-4">
                  <div class="flex items-center justify-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span class="text-white font-bold text-sm">PG</span>
                    </div>
                  </div>
                  <p class="text-center text-sm text-gray-500 mt-2">示例游戏图标</p>
                </div>
                
                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.gameCardIcon">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="text-center">
                        <n-radio value="european" class="mb-2">
                          <div class="p-4 bg-white rounded border-2" :class="layoutConfig.gameCardIcon === 'european' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto flex items-center justify-center">
                              <span class="text-white font-bold">WG</span>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">欧风版</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="classic" class="mb-2">
                          <div class="p-4 bg-white rounded border-2" :class="layoutConfig.gameCardIcon === 'classic' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl mx-auto flex items-center justify-center">
                              <span class="text-white font-bold">WG</span>
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
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  弹窗样式 
                  <span v-if="!isEditMode">样式2</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border p-4">
                  <div class="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300 flex items-center justify-center relative">
                    <div class="absolute top-2 right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">×</span>
                    </div>
                    <div class="text-center">
                      <div class="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span class="text-white">!</span>
                      </div>
                      <p class="text-sm text-gray-600">弹窗样式预览</p>
                    </div>
                  </div>
                  <p class="text-center text-sm text-gray-500 mt-2">弹窗布局样式</p>
                </div>
                
                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.popupStyle">
                    <div class="grid grid-cols-4 gap-3">
                      <div v-for="i in 4" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div class="w-20 h-16 bg-white rounded border-2 relative" 
                               :class="layoutConfig.popupStyle === `style${i}` ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div class="flex items-center justify-center h-full">
                              <div class="w-4 h-4 rounded-full mx-auto"
                                   :class="i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-green-500' : i === 3 ? 'bg-red-500' : 'bg-purple-500'">
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

              <!-- Page Turn Style Section -->
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  翻页样式 
                  <span v-if="!isEditMode">手动加载</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border p-4">
                  <div class="text-center space-y-2">
                    <p class="text-sm text-gray-600">正在加载...</p>
                    <p class="text-xs text-gray-500">请于浏览器上滑动中控12楼</p>
                    <div class="border-t pt-2 mt-4">
                      <p class="text-sm text-blue-600 flex items-center justify-center gap-1">
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
                          <div class="p-4 bg-white rounded border-2" :class="layoutConfig.pageStyle === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="text-center space-y-1">
                              <div class="text-xs text-gray-600">自动加载中...</div>
                              <div class="w-4 h-1 bg-blue-500 rounded mx-auto animate-pulse"></div>
                            </div>
                          </div>
                        </n-radio>
                        <p class="text-xs">自动加载</p>
                      </div>
                      <div class="text-center">
                        <n-radio value="manual" class="mb-2">
                          <div class="p-4 bg-white rounded border-2" :class="layoutConfig.pageStyle === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="text-center space-y-1">
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
              <div class="border rounded-lg p-6 bg-gray-50">
                <h4 class="text-md font-medium text-gray-900 mb-4">
                  Lobby按钮样式 
                  <span v-if="!isEditMode">样式1</span>
                  <span v-if="isEditMode" class="text-blue-500 ml-2">✓</span>
                </h4>
                
                <!-- View Mode -->
                <div v-if="!isEditMode" class="bg-white rounded-lg border p-4">
                  <div class="flex items-center justify-center">
                    <div class="text-center">
                      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                        <span class="text-white text-lg">🏠</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700">首页</p>
                    </div>
                  </div>
                  <p class="text-center text-sm text-gray-500 mt-2">Lobby按钮预览</p>
                </div>
                
                <!-- Edit Mode -->
                <div v-if="isEditMode" class="space-y-4">
                  <n-radio-group v-model:value="layoutConfig.lobbyButtonStyle">
                    <div class="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                      <div v-for="i in 10" :key="i" class="text-center">
                        <n-radio :value="`style${i}`" class="mb-2">
                          <div class="p-2 bg-white rounded border-2" :class="layoutConfig.lobbyButtonStyle === `style${i}` ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <div class="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white text-xs mb-1"
                                 :class="i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-gray-500' : i === 3 ? 'bg-gray-600' : i === 4 ? 'bg-black' : i === 5 ? 'bg-gray-400' : i === 6 ? 'bg-gray-700' : i === 7 ? 'bg-yellow-500' : i === 8 ? 'bg-black' : i === 9 ? 'bg-blue-600' : 'bg-gray-800'">
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
              <div v-if="isEditMode" class="flex justify-center space-x-4 pt-6 border-t">
                <n-button @click="cancelEdit" size="large">取消</n-button>
                <n-button type="primary" @click="() => { console.log('🔘 Save button clicked!'); saveConfig(); }" size="large">保存</n-button>
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 2: 按钮配置 -->
          <n-tab-pane name="buttons" tab="按钮配置">
            <div class="p-6 space-y-6">
              <!-- Header with Edit Button -->
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">底部导航</h3>
                  <p class="text-sm text-gray-600">配置底部导航按钮</p>
                </div>
                <div class="flex space-x-3">
                  <n-button v-if="!isButtonEditMode" @click="showIconUploadModal = true">上传图标</n-button>
                  <n-button v-if="!isButtonEditMode" type="primary" @click="enterButtonEditMode">修改</n-button>
                </div>
              </div>

              <!-- Button Configuration Sections -->
              <div v-if="isButtonEditMode" class="space-y-8">
                <!-- 登录前 Section -->
                <div class="border rounded-lg p-6 bg-gray-50">
                  <h4 class="text-md font-medium text-gray-900 mb-4">登入前</h4>
                  <div class="grid grid-cols-5 gap-4 place-items-center">
                    <div 
                      v-for="(button, index) in buttonConfig.beforeLogin" 
                      :key="index"
                      class="text-center"
                    >
                      <div 
                        class="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                        @click="openIconSelector('beforeLogin', index)"
                      >
                        <div v-if="button.icon" class="text-center">
                          <img v-if="getIconImageUrl(button)" 
                               :src="getIconImageUrl(button)" 
                               :alt="button.label"
                               class="w-8 h-8 mx-auto mb-1 object-contain" />
                          <div v-else class="text-2xl mb-1">{{ getIconDisplay(button.icon) }}</div>
                          <div class="text-xs text-gray-600">{{ button.label }}</div>
                        </div>
                        <div v-else class="text-gray-400 text-2xl">+</div>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">按钮{{ index + 1 }}</p>
                    </div>
                  </div>
                </div>

                <!-- 登录后 Section -->
                <div class="border rounded-lg p-6 bg-gray-50">
                  <h4 class="text-md font-medium text-gray-900 mb-4">登入后</h4>
                  <div class="grid grid-cols-5 gap-4 place-items-center">
                    <div 
                      v-for="(button, index) in buttonConfig.afterLogin" 
                      :key="index"
                      class="text-center"
                    >
                      <div 
                        class="w-16 h-16 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                        @click="openIconSelector('afterLogin', index)"
                      >
                        <div v-if="button.icon" class="text-center">
                          <img v-if="getIconImageUrl(button)" 
                               :src="getIconImageUrl(button)" 
                               :alt="button.label"
                               class="w-8 h-8 mx-auto mb-1 object-contain" />
                          <div v-else class="text-2xl mb-1">{{ getIconDisplay(button.icon) }}</div>
                          <div class="text-xs text-gray-600">{{ button.label }}</div>
                        </div>
                        <div v-else class="text-gray-400 text-2xl">+</div>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">按钮{{ index + 1 }}</p>
                    </div>
                  </div>
                </div>

                <!-- Validation Error -->
                <div v-if="showValidationError" class="text-red-500 text-sm text-center">
                  请设置完整按钮再做模板配置
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-center space-x-4 pt-6 border-t">
                  <n-button @click="cancelButtonEdit" size="large">取消</n-button>
                  <n-button @click="generatePreview" size="large">生成预览</n-button>
                  <n-button type="primary" @click="saveButtonConfig" size="large">保存</n-button>
                </div>
              </div>

              <!-- View Mode Display -->
              <div v-if="!isButtonEditMode" class="space-y-8">
                <div class="text-center py-12 bg-gray-50 rounded-lg">
                  <p class="text-gray-500">点击"修改"按钮开始配置底部导航</p>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- Right Panel - Mobile Preview -->
      <div class="w-100 bg-white rounded-lg shadow-sm border p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4 text-center">实时预览</h3>
        
        <!-- Mobile Frame -->
        <div class="mx-auto w-200 h-[600px] bg-black rounded-[2rem] p-3 shadow-2xl">
          <div class="w-full h-full bg-white rounded-[1.5rem] overflow-hidden relative">
            <!-- Mobile Content Preview -->
            <iframe 
              ref="previewIframe"
              :src="previewUrl"
              class="w-full h-full border-0"
              @load="handleIframeLoad"
            >
            </iframe>
            
            <!-- Fallback Preview Content (when iframe not available) -->
            <div v-if="!previewUrl" class="w-full h-full overflow-y-auto">
              <!-- Top Banner -->
              <div class="h-20 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-between px-4">
                <div class="text-white font-bold text-lg">JACKPOT</div>
                <div class="flex gap-2">
                  <button class="bg-white bg-opacity-20 text-white px-3 py-1 rounded text-sm">登录</button>
                  <button class="bg-white text-blue-600 px-3 py-1 rounded text-sm">注册</button>
                </div>
              </div>

              <!-- Navigation Icons -->
              <div class="grid grid-cols-4 gap-4 p-4 bg-gray-50">
                <div class="text-center">
                  <div class="w-12 h-12 bg-red-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                    <span class="text-white text-xs">🎁</span>
                  </div>
                  <span class="text-xs text-gray-600">优惠</span>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                    <span class="text-white text-xs">💰</span>
                  </div>
                  <span class="text-xs text-gray-600">充值</span>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                    <span class="text-white text-xs">👥</span>
                  </div>
                  <span class="text-xs text-gray-600">代理</span>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-1 flex items-center justify-center">
                    <span class="text-white text-xs">👤</span>
                  </div>
                  <span class="text-xs text-gray-600">我的</span>
                </div>
              </div>

              <!-- Game Cards -->
              <div class="p-4 space-y-3">
                <h4 class="font-medium text-gray-800">热门游戏</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg h-16 flex items-center justify-center">
                    <span class="text-white font-bold text-sm">PG</span>
                  </div>
                  <div class="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg h-16 flex items-center justify-center">
                    <span class="text-white font-bold text-sm">捕鱼</span>
                  </div>
                  <div class="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg h-16 flex items-center justify-center">
                    <span class="text-white font-bold text-sm">体育</span>
                  </div>
                </div>
              </div>

              <!-- Self-promotion Banner (conditional) -->
              <div v-if="selfPromotionEnabled" class="mx-4 mb-4">
                <div class="h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <span class="text-white font-medium text-sm">自营广告横幅</span>
                </div>
              </div>

              <!-- Bottom Navigation -->
              <div class="absolute bottom-0 left-0 right-0 h-16 bg-white border-t">
                <div class="flex items-center justify-around h-full px-2">
                  <div 
                    v-for="(button, index) in getActiveButtons()" 
                    :key="index"
                    class="flex flex-col items-center"
                  >
                    <img v-if="getIconImageUrl(button)" 
                         :src="getIconImageUrl(button)" 
                         :alt="button.label"
                         class="w-4 h-4 mx-auto mb-1 object-contain" />
                    <div v-else-if="button.icon" class="text-xs mb-1">{{ getIconDisplay(button.icon) }}</div>
                    <div v-else class="w-6 h-6 bg-gray-200 rounded mb-1"></div>
                    <span class="text-xs text-gray-600">{{ button.label || '按钮' }}</span>
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
    <n-modal v-model:show="showEditModal" preset="dialog" title="修改皮肤样式名称">
      <div class="space-y-4">
        <n-form>
          <n-form-item label="样式名称">
            <n-input v-model:value="editingSkinName" placeholder="请输入皮肤样式名称" />
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
      style="width: 600px; max-height: 70vh;"
    >
      <div class="max-h-96 overflow-y-auto">
        <div class="grid grid-cols-6 gap-4 p-4">
          <div 
            v-for="iconItem in availableIcons" 
            :key="iconItem.key"
            class="text-center cursor-pointer p-3 rounded-lg border-2 transition-all hover:border-blue-400"
            :class="selectedIcon === iconItem.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            @click="selectIcon(iconItem.key)"
          >
            <img v-if="iconItem.imageUrl" 
                 :src="iconItem.imageUrl" 
                 :alt="iconItem.label"
                 class="w-8 h-8 mx-auto mb-2 object-contain" />
            <div v-else class="text-2xl mb-2">{{ iconItem.display }}</div>
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
      style="width: 500px;"
    >
      <div class="space-y-4">
        <n-form>
          <n-form-item label="图标标识">
            <n-input v-model:value="uploadForm.iconKey" placeholder="例如: home, promotion" />
          </n-form-item>
          <n-form-item label="图标名称">
            <n-input v-model:value="uploadForm.iconLabel" placeholder="例如: 首页, 优惠" />
          </n-form-item>
          <n-form-item label="分类">
            <n-input v-model:value="uploadForm.category" placeholder="例如: navigation, action" />
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
          <img :src="uploadPreview" alt="预览" class="w-16 h-16 mx-auto object-contain border rounded" />
          <p class="text-xs text-gray-500 mt-2">图标预览</p>
        </div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="closeUploadModal">取消</n-button>
          <n-button type="primary" @click="uploadIcon" :loading="uploading">上传</n-button>
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
  useMessage 
} from 'naive-ui';
import { LayoutDesignApi, PublicLayoutApi } from '../../api/layout-design';
import type { LayoutConfig, ButtonConfig, AvailableIcon, BrandSkinConfig } from '../../api/layout-design';
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
  file: null as File | null
});

// Layout configuration values
const layoutConfig = reactive({
  bannerStyle: 'common',
  myPageStyle: 'style1',
  gameCardIcon: 'european',
  popupStyle: 'style2',
  pageStyle: 'manual',
  lobbyButtonStyle: 'style1'
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
    { icon: '', label: '' }
  ],
  afterLogin: [
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' },
    { icon: '', label: '' }
  ]
});

// Available icons list (will be loaded from API)
const availableIcons = ref<Array<{
  id: number;
  key: string;
  label: string;
  display: string;
  imageUrl?: string;
  imageType?: string;
  category?: string;
}>>([]);

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
    const iconData = availableIcons.value.find(icon => icon.key === selectedIcon.value);
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
          imageUrl: iconData.imageUrl
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
          imageUrl: iconData.imageUrl
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
  const iconData = availableIcons.value.find(icon => icon.key === iconKey);
  return iconData ? iconData.display : '';
};

const getIconImageUrl = (iconKeyOrButton: string | { icon: string; imageUrl?: string }) => {
  // If it's a button object with imageUrl, use it directly
  if (typeof iconKeyOrButton === 'object' && iconKeyOrButton.imageUrl) {
    return iconKeyOrButton.imageUrl;
  }
  
  // Otherwise, look up by iconKey in available icons
  const iconKey = typeof iconKeyOrButton === 'string' ? iconKeyOrButton : iconKeyOrButton.icon;
  const iconData = availableIcons.value.find(icon => icon.key === iconKey);
  return iconData ? iconData.imageUrl : '';
};

const validateButtonConfig = () => {
  const beforeLoginValid = buttonConfig.beforeLogin.every(btn => btn.icon && btn.label);
  const afterLoginValid = buttonConfig.afterLogin.every(btn => btn.icon && btn.label);
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
  const hasConfiguredButtons = buttonConfig.beforeLogin.some(btn => btn.icon);
  return hasConfiguredButtons ? buttonConfig.beforeLogin : [
    { icon: 'home', label: '首页' },
    { icon: 'promotion', label: '优惠' },
    { icon: 'deposit', label: '充值' },
    { icon: 'service', label: '客服' },
    { icon: 'profile', label: '我的' }
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
    file: uploadForm.file ? {
      name: uploadForm.file.name,
      size: uploadForm.file.size,
      type: uploadForm.file.type
    } : null
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
      availableIcons.value = response.data.map(icon => ({
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
        colorName: colorName
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
        lobbyButtonStyle: existingConfig.lobbyButtonStyle || 'style1'
      });
      
      // Update button configuration if available
      if (existingConfig.buttonConfigs && Array.isArray(existingConfig.buttonConfigs)) {
        console.log(' Processing button configs array:', existingConfig.buttonConfigs);
        
        // Transform array format to grouped format
        const beforeLogin = Array.from({ length: 5 }, () => ({ icon: '', label: '', imageUrl: '' }));
        const afterLogin = Array.from({ length: 5 }, () => ({ icon: '', label: '', imageUrl: '' }));
        
        existingConfig.buttonConfigs.forEach((btn: any) => {
          const buttonData = {
            icon: btn.iconKey || '',
            label: btn.iconLabel || '',
            imageUrl: btn.imageUrl || ''
          };
          
          console.log(`🔘 Processing button: ${btn.buttonGroup}[${btn.buttonIndex}] = ${btn.iconKey} (${btn.imageUrl})`);
          
          if (btn.buttonGroup === 'beforeLogin' && btn.buttonIndex >= 0 && btn.buttonIndex < 5) {
            beforeLogin[btn.buttonIndex] = buttonData;
          } else if (btn.buttonGroup === 'afterLogin' && btn.buttonIndex >= 0 && btn.buttonIndex < 5) {
            afterLogin[btn.buttonIndex] = buttonData;
          }
        });
        
        console.log(' Final beforeLogin config:', beforeLogin);
        console.log(' Final afterLogin config:', afterLogin);
        
        buttonConfig.beforeLogin = beforeLogin;
        buttonConfig.afterLogin = afterLogin;
      } else if (existingConfig.buttonConfigs && typeof existingConfig.buttonConfigs === 'object') {
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
      console.log('ℹ️ No existing configuration found, will create new one on first save');
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
      response = await LayoutDesignApi.updateLayoutConfig(layoutConfigId.value, requestData);
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
    loadBrandSkinConfig() // Load brand skin config on mount
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
    'common': '通用Banner',
    'small': '小Banner',
    'scroll': '滚动Banner',
    'large': '大Banner'
  };
  return styleMap[layoutConfig.bannerStyle] || layoutConfig.bannerStyle;
});

const myPageStyleDisplayName = computed(() => {
  const styleNumber = layoutConfig.myPageStyle.replace('style', '');
  return `样式${styleNumber}`;
});

const gameCardIconDisplayName = computed(() => {
  const iconMap: Record<string, string> = {
    'european': '欧规版',
    'classic': '经典版'
  };
  return iconMap[layoutConfig.gameCardIcon] || layoutConfig.gameCardIcon;
});

const popupStyleDisplayName = computed(() => {
  const styleNumber = layoutConfig.popupStyle.replace('style', '');
  return `样式${styleNumber}`;
});

const pageStyleDisplayName = computed(() => {
  const styleMap: Record<string, string> = {
    'auto': '自动加载',
    'manual': '手动加载'
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