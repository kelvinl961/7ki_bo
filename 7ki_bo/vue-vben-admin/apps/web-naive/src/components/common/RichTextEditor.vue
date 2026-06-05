<template>
  <div class="rich-text-editor">
    <Editor
      v-model="content"
      license-key="gpl"
      :init="editorInit"
      :disabled="disabled"
    />
    <div v-if="maxLength" class="rich-text-editor__counter">
      {{ charCount }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMessage } from 'naive-ui';
import Editor from '@tinymce/tinymce-vue';

import 'tinymce/tinymce';
import 'tinymce/icons/default/icons.min.js';
import 'tinymce/themes/silver/theme.min.js';
import 'tinymce/models/dom/model.min.js';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/content/default/content.min.css';
import 'tinymce/plugins/advlist/plugin.min.js';
import 'tinymce/plugins/autolink/plugin.min.js';
import 'tinymce/plugins/lists/plugin.min.js';
import 'tinymce/plugins/link/plugin.min.js';
import 'tinymce/plugins/image/plugin.min.js';
import 'tinymce/plugins/media/plugin.min.js';
import 'tinymce/plugins/table/plugin.min.js';
import 'tinymce/plugins/code/plugin.min.js';
import 'tinymce/plugins/help/plugin.min.js';
import 'tinymce/plugins/wordcount/plugin.min.js';
import 'tinymce/plugins/quickbars/plugin.min.js';

import { uploadSingleImage } from '#/api/upload';
import { uploadMediaFile } from '#/api/mediaLibrary';
import { getImageUrlByEnvironment } from '#/utils/imageUtils';

interface Props {
  modelValue?: string;
  placeholder?: string;
  height?: number;
  maxLength?: number;
  disabled?: boolean;
  uploadCategory?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容',
  height: 380,
  maxLength: 10000,
  disabled: false,
  uploadCategory: 'activity',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const message = useMessage();
const content = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (value) => {
    if (value !== content.value) {
      content.value = value || '';
    }
  },
);

watch(content, (value) => {
  emit('update:modelValue', value || '');
});

const charCount = computed(() => content.value?.length || 0);

async function uploadEditorFile(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    const uploaded = await uploadSingleImage(file, {
      category: props.uploadCategory,
      isPublic: true,
    });
    return getImageUrlByEnvironment(uploaded.url);
  }

  const response = await uploadMediaFile(file, {
    filename: file.name,
    category: props.uploadCategory,
    description: `Uploaded from ${props.uploadCategory}`,
    isPublic: true,
  });

  if (!response.success || !response.data?.url) {
    throw new Error('Upload failed');
  }

  return getImageUrlByEnvironment(response.data.url);
}

const editorInit = computed(() => ({
  height: props.height,
  menubar: false,
  branding: false,
  promotion: false,
  placeholder: props.placeholder,
  plugins:
    'advlist autolink lists link image media table code help wordcount quickbars',
  toolbar:
    'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | removeformat code',
  quickbars_selection_toolbar:
    'bold italic underline | quicklink blockquote quickimage',
  quickbars_insert_toolbar: 'quickimage quicktable',
  automatic_uploads: true,
  convert_urls: false,
  relative_urls: false,
  remove_script_host: false,
  file_picker_types: 'file image media',
  images_upload_handler: (
    blobInfo: { blob: () => Blob; filename: () => string },
    progress: (percent: number) => void,
  ) =>
    new Promise<string>((resolve, reject) => {
      const blob = blobInfo.blob();
      const file = new File([blob], blobInfo.filename(), { type: blob.type });

      progress(0);
      uploadEditorFile(file)
        .then((url) => {
          progress(100);
          resolve(url);
        })
        .catch((error: unknown) => {
          const errMsg =
            error instanceof Error ? error.message : '图片上传失败';
          message.error(errMsg);
          reject(errMsg);
        });
    }),
  file_picker_callback: (
    callback: (url: string, meta?: Record<string, string>) => void,
    _value: string,
    meta: { filetype: string },
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      meta.filetype === 'image'
        ? 'image/*'
        : meta.filetype === 'media'
          ? 'video/*,audio/*'
          : '*/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const url = await uploadEditorFile(file);
        callback(url, { title: file.name, text: file.name });
        message.success('上传成功');
      } catch (error: unknown) {
        console.error('Rich text file upload failed:', error);
        message.error('文件上传失败，请重试');
      }
    };

    input.click();
  },
  setup: (editor: {
    on: (event: string, handler: () => void) => void;
    getContent: () => string;
    setContent: (value: string) => void;
  }) => {
    if (!props.maxLength) return;

    const enforceMaxLength = () => {
      const html = editor.getContent();
      if (html.length <= props.maxLength!) return;
      editor.setContent(html.slice(0, props.maxLength));
      message.warning(`内容不能超过 ${props.maxLength} 个字符`);
    };

    editor.on('input change undo redo', enforceMaxLength);
  },
}));
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.rich-text-editor__counter {
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: #6b7280;
}

.rich-text-editor :deep(.tox-tinymce) {
  border-radius: 8px;
  border-color: #e5e7eb;
}
</style>
