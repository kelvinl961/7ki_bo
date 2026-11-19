/**
 * Modal prompt for BO Google Authenticator / backup codes.
 * Used by money-route X-Totp-Code retries (and can be reused elsewhere).
 */
import { h, reactive } from 'vue';

import { NInput, createDiscreteApi } from 'naive-ui';

const { dialog, message } = createDiscreteApi(['dialog', 'message']);

let promptInFlight: Promise<null | string> | null = null;

export function promptBoTotpCode(options?: {
  content?: string;
  title?: string;
}): Promise<null | string> {
  if (promptInFlight) return promptInFlight;

  const state = reactive({ code: '' });

  const run: Promise<null | string> = new Promise((resolve) => {
    let settled = false;
    const finish = (value: null | string) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const d = dialog.create({
      title: options?.title || 'Google Authenticator',
      content: () =>
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
          h(
            'p',
            {
              style: {
                margin: '0',
                fontSize: '13px',
                lineHeight: '1.5',
                opacity: '0.75',
              },
            },
            options?.content ||
              'Enter the 6-digit code from Google Authenticator (or an 8-digit backup code).',
          ),
          h(NInput, {
            value: state.code,
            maxlength: 12,
            placeholder: '123456',
            size: 'large',
            autofocus: true,
            style: {
              letterSpacing: '0.25em',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: '600',
            },
            'onUpdate:value': (v: string) => {
              state.code = String(v || '').replace(/\s/g, '');
            },
            onKeydown: (e: KeyboardEvent) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const code = state.code.trim();
              if (code.length < 6) {
                message.warning('Enter a valid authenticator code');
                return;
              }
              d.destroy();
              finish(code);
            },
          }),
        ]),
      positiveText: 'Verify',
      negativeText: 'Cancel',
      maskClosable: false,
      onPositiveClick: () => {
        const code = state.code.trim();
        if (code.length < 6) {
          message.warning('Enter a valid authenticator code');
          return false;
        }
        finish(code);
        return true;
      },
      onNegativeClick: () => {
        finish(null);
      },
      onClose: () => {
        finish(null);
      },
    });
  });

  promptInFlight = run.finally(() => {
    promptInFlight = null;
  });

  return run;
}
