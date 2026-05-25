import { useMessage } from 'naive-ui';

import { domainApi } from '../api/domainApi';

export function parseDomainCreateResponse(response: any) {
  const code = response.code ?? response.data?.code ?? 0;
  const result = response.data || response;
  const subdomains = result.data?.subdomains || result.subdomains || [];
  const errors = result.data?.errors || result.errors || [];
  const msg = response.message ?? result.message;
  const processing = subdomains.some((s: any) => s.setupStatus === 'processing');
  return { code, subdomains, errors, message: msg, processing };
}

/**
 * Submit domain create without blocking the modal — closes immediately, shows toasts when API finishes.
 */
export function useDomainCreateSubmit() {
  const message = useMessage();

  function submitInBackground(options: {
    domainData: Record<string, unknown>;
    submittedCount: number;
    useType: string;
    cdnProvider: string;
    onlyRootDomain: boolean;
    onSuccess?: () => void;
  }) {
    const { domainData, submittedCount, useType, cdnProvider, onlyRootDomain, onSuccess } =
      options;

    const isWebHallCloudflare =
      cdnProvider === 'CLOUDFLARE' && useType === 'WEB_HALL';

    if (isWebHallCloudflare) {
      message.info(
        `已提交 ${submittedCount} 个子域名，Cloudflare 配置正在后台执行（约1–2分钟），请稍后刷新列表。`,
        { duration: 6000 },
      );
    } else {
      message.info(`正在创建 ${submittedCount} 个子域名…`, { duration: 3000 });
    }

    domainApi
      .createDomain(domainData as any)
      .then((response: any) => {
        const { code, subdomains, errors, message: apiMsg, processing } =
          parseDomainCreateResponse(response);

        if (code === 0 && subdomains.length > 0) {
          if (processing) {
            message.success(
              apiMsg ||
                `已创建 ${subdomains.length} 个子域名，CDN 配置仍在后台进行中，请稍后刷新。`,
              { duration: 6000 },
            );
          } else if (errors.length > 0) {
            message.warning(
              `成功创建 ${subdomains.length} 个，${errors.length} 个失败：${errors.join('; ')}`,
            );
          } else {
            message.success(apiMsg || `成功创建 ${subdomains.length} 个子域名！`);
          }
          onSuccess?.();
          return;
        }

        if (code === 0 && subdomains.length === 0 && onlyRootDomain) {
          message.warning(
            `主域名已存在。DNS 可能未更新，请在 Cloudflare 中手动检查。`,
          );
          onSuccess?.();
          return;
        }

        if (code === 0 && subdomains.length === 1 && onlyRootDomain) {
          message.success(`主域名 DNS 记录已更新！`);
          onSuccess?.();
          return;
        }

        if (errors.length > 0) {
          message.error(`创建失败：${errors.join('; ')}`);
        } else {
          message.error(apiMsg || '创建失败');
        }
      })
      .catch((error: any) => {
        console.error('Create domain error:', error);
        message.error(error.message || '创建失败，请重试');
      });
  }

  return { submitInBackground };
}
