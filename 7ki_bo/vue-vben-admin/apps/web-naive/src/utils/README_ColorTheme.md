# 动态颜色主题系统

这个系统可以自动从品牌的主色调生成次色和强调色，用于动态主题化。

## 功能特性

- 🎨 **自动色彩生成**: 从主色自动生成次色和强调色
- 🔄 **动态主题切换**: 运行时切换品牌主题色彩
- 🎯 **CSS类替换**: 自动替换预定义的CSS类名
- 🚀 **Vue组合式API**: 提供reactive的主题管理

## 使用方法

### 1. 基础用法

```typescript
import { useColorTheme } from '@/composables/useColorTheme';
import { generateColorPalette, getPrimaryColorById } from '@/utils/colorUtils';

const { setSkinColor, applyThemeToContent } = useColorTheme();

// 设置主题色
setSkinColor('1687419125085335554'); // Tom Ford绿

// 应用主题到内容
const themedContent = applyThemeToContent(htmlContent, skinColorId);
```

### 2. 在组件中使用

```vue
<template>
  <div class="my-component">
    <!-- 这些类名会被自动替换 -->
    <button class="bg-[#D86682] text-white">主要按钮</button>
    <button class="bg-[#CC5477] text-white">次要按钮</button>
    <button class="bg-[#E06F8B] text-white">强调按钮</button>
  </div>
</template>

<script setup>
import { useColorTheme } from '@/composables/useColorTheme';

const { applyThemeToContent } = useColorTheme();

// 在需要时应用主题
const processedContent = applyThemeToContent(content, skinColorId);
</script>
```

### 3. 获取颜色信息

```typescript
import {
  useColorTheme,
  useSkinColorOptions,
} from '@/composables/useColorTheme';

const { getColorInfo, generateColorPreview } = useColorTheme();
const { getSkinColorLabel } = useSkinColorOptions();

// 获取完整颜色信息
const colorInfo = getColorInfo('1687419125085335554');
console.log(colorInfo.palette); // { primary: '#10B981', secondary: '#059669', accent: '#34D399' }

// 获取标签
const label = getSkinColorLabel('1687419125085335554'); // 'Tom Ford绿'
```

## 颜色生成算法

系统使用HSL色彩空间来生成协调的颜色搭配：

- **主色**: 数据库中存储的原始颜色
- **次色**: 饱和度降低20%，亮度降低20%（更深、更淡）
- **强调色**: 色相偏移15度，饱和度增加10%，亮度增加15%（更亮、更鲜艳）

## CSS类名映射

系统会自动替换以下CSS类名：

| 原始类名           | 替换为                 | 描述       |
| ------------------ | ---------------------- | ---------- |
| `bg-[#D86682]`     | `bg-[{primary}]`       | 主色背景   |
| `bg-[#CC5477]`     | `bg-[{secondary}]`     | 次色背景   |
| `bg-[#E06F8B]`     | `bg-[{accent}]`        | 强调色背景 |
| `text-[#D86682]`   | `text-[{primary}]`     | 主色文字   |
| `text-[#CC5477]`   | `text-[{secondary}]`   | 次色文字   |
| `text-[#E06F8B]`   | `text-[{accent}]`      | 强调色文字 |
| `border-[#D86682]` | `border-[{primary}]`   | 主色边框   |
| `border-[#CC5477]` | `border-[{secondary}]` | 次色边框   |
| `border-[#E06F8B]` | `border-[{accent}]`    | 强调色边框 |

## 支持的品牌颜色

系统预定义了以下品牌颜色：

- Bvlgari蓝黑 (`15`)
- Tom Ford绿 (`1687419125085335554`)
- Ferrari黑黄 (`1687419804829954050`)
- Armani黑红 (`1687423728032313346`)
- ... 等46种品牌色彩

## API 参考

### `useColorTheme()`

```typescript
interface ColorTheme {
  // 状态
  currentSkinColorId: Ref<string>;
  currentPalette: Ref<ColorPalette | null>;
  currentColorClasses: Ref<ColorClasses | null>;

  // 计算属性
  isThemeActive: ComputedRef<boolean>;
  primaryColor: ComputedRef<string>;
  secondaryColor: ComputedRef<string>;
  accentColor: ComputedRef<string>;

  // 方法
  setSkinColor: (skinColorId: string) => void;
  applyThemeToContent: (content: string, skinColorId?: string) => string;
  getColorInfo: (skinColorId: string) => BrandColorInfo;
  getPreviewStyles: (skinColorId: string) => Record<string, string>;
  generateColorPreview: (skinColorId: string) => ColorPreview;
}
```

### `generateColorPalette(primaryColor: string)`

从主色生成完整的颜色搭配：

```typescript
interface ColorPalette {
  primary: string; // 主色
  secondary: string; // 次色
  accent: string; // 强调色
}
```

### `applyColorTheme(content: string, skinColorId: string)`

应用颜色主题到HTML/CSS内容：

```typescript
const themedHTML = applyColorTheme(
  `
  <div class="bg-[#D86682] text-[#CC5477] border-[#E06F8B]">
    主题化内容
  </div>
`,
  '1687419125085335554',
);

// 输出: <div class="bg-[#10B981] text-[#059669] border-[#34D399]">主题化内容</div>
```

## 最佳实践

1. **使用预定义的颜色类名**: 始终使用 `#D86682`、`#CC5477`、`#E06F8B` 作为占位符
2. **颜色一致性**: 确保整个应用使用相同的颜色映射规则
3. **性能考虑**: 避免频繁切换主题，考虑缓存生成的CSS
4. **可访问性**: 确保生成的颜色搭配有足够的对比度

## 示例项目

查看 `BrandLogoSetting.vue` 中的"颜色主题演示"标签页，了解完整的使用示例。
