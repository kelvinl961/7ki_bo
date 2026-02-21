// .vitepress/config/index.mts
import { withPwa } from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/@vite-pwa+vitepress@1.0.1_vite-plugin-pwa@1.1.0_vite@5.4.20_@types+node@24.7.2_less@4.4_037dbb1f7bed672b73d0f9a447dc591a/node_modules/@vite-pwa/vitepress/dist/index.mjs";
import { defineConfigWithTheme } from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.40.1_@types+node@24.7.2_async-validator@4.2.5__88ad971b1f7e7f00245c3360ffaecd5a/node_modules/vitepress/dist/node/index.js";

// .vitepress/config/en.mts
import { defineConfig } from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.40.1_@types+node@24.7.2_async-validator@4.2.5__88ad971b1f7e7f00245c3360ffaecd5a/node_modules/vitepress/dist/node/index.js";

// ../package.json
var version = "5.5.7";

// .vitepress/config/en.mts
var en = defineConfig({
  description: "Vben Admin & Enterprise level management system framework",
  lang: "en-US",
  themeConfig: {
    darkModeSwitchLabel: "Theme",
    darkModeSwitchTitle: "Switch to Dark Mode",
    docFooter: {
      next: "Next Page",
      prev: "Previous Page"
    },
    editLink: {
      pattern: "https://github.com/vbenjs/vue-vben-admin/edit/main/docs/src/:path",
      text: "Edit this page on GitHub"
    },
    footer: {
      copyright: `Copyright \xA9 2020-${(/* @__PURE__ */ new Date()).getFullYear()} Vben`,
      message: "Released under the MIT License."
    },
    langMenuLabel: "Language",
    lastUpdated: {
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      },
      text: "Last updated on"
    },
    lightModeSwitchTitle: "Switch to Light Mode",
    nav: nav(),
    outline: {
      label: "Navigate"
    },
    returnToTopLabel: "Back to top",
    sidebar: {
      "/en/commercial/": {
        base: "/en/commercial/",
        items: sidebarCommercial()
      },
      "/en/guide/": { base: "/en/guide/", items: sidebarGuide() }
    }
  }
});
function sidebarGuide() {
  return [
    {
      collapsed: false,
      text: "Introduction",
      items: [
        {
          link: "introduction/vben",
          text: "About Vben Admin"
        },
        {
          link: "introduction/why",
          text: "Why Choose Us?"
        },
        { link: "introduction/quick-start", text: "Quick Start" },
        { link: "introduction/thin", text: "Lite Version" }
      ]
    },
    {
      text: "Basics",
      items: [
        { link: "essentials/concept", text: "Basic Concepts" },
        { link: "essentials/development", text: "Local Development" },
        { link: "essentials/route", text: "Routing and Menu" },
        { link: "essentials/settings", text: "Configuration" },
        { link: "essentials/icons", text: "Icons" },
        { link: "essentials/styles", text: "Styles" },
        { link: "essentials/external-module", text: "External Modules" },
        { link: "essentials/build", text: "Build and Deployment" },
        { link: "essentials/server", text: "Server Interaction and Data Mock" }
      ]
    },
    {
      text: "Advanced",
      items: [
        { link: "in-depth/login", text: "Login" },
        { link: "in-depth/theme", text: "Theme" },
        { link: "in-depth/access", text: "Access Control" },
        { link: "in-depth/locale", text: "Internationalization" },
        { link: "in-depth/features", text: "Common Features" },
        { link: "in-depth/check-updates", text: "Check Updates" },
        { link: "in-depth/loading", text: "Global Loading" },
        { link: "in-depth/ui-framework", text: "UI Framework Switching" }
      ]
    },
    {
      text: "Engineering",
      items: [
        { link: "project/standard", text: "Standards" },
        { link: "project/cli", text: "CLI" },
        { link: "project/dir", text: "Directory Explanation" },
        { link: "project/test", text: "Unit Testing" },
        { link: "project/tailwindcss", text: "Tailwind CSS" },
        { link: "project/changeset", text: "Changeset" },
        { link: "project/vite", text: "Vite Config" }
      ]
    },
    {
      text: "Others",
      items: [
        { link: "other/project-update", text: "Project Update" },
        { link: "other/remove-code", text: "Remove Code" },
        { link: "other/faq", text: "FAQ" }
      ]
    }
  ];
}
function sidebarCommercial() {
  return [
    {
      link: "community",
      text: "Community"
    },
    {
      link: "technical-support",
      text: "Technical-support"
    },
    {
      link: "customized",
      text: "Customized"
    }
  ];
}
function nav() {
  return [
    {
      activeMatch: "^/en/(guide|components)/",
      text: "Doc",
      items: [
        {
          activeMatch: "^/en/guide/",
          link: "/en/guide/introduction/vben",
          text: "Guide"
        },
        // {
        //   activeMatch: '^/en/components/',
        //   link: '/en/components/introduction',
        //   text: 'Components',
        // },
        {
          text: "Historical Versions",
          items: [
            {
              link: "https://doc.vvbin.cn",
              text: "2.x Version Documentation"
            }
          ]
        }
      ]
    },
    {
      text: "Demo",
      items: [
        {
          text: "Vben Admin",
          items: [
            {
              link: "https://www.vben.pro",
              text: "Demo Version"
            },
            {
              link: "https://ant.vben.pro",
              text: "Ant Design Vue Version"
            },
            {
              link: "https://naive.vben.pro",
              text: "Naive Version"
            },
            {
              link: "https://ele.vben.pro",
              text: "Element Plus Version"
            }
          ]
        },
        {
          text: "Others",
          items: [
            {
              link: "https://vben.vvbin.cn",
              text: "Vben Admin 2.x"
            }
          ]
        }
      ]
    },
    {
      text: version,
      items: [
        {
          link: "https://github.com/vbenjs/vue-vben-admin/releases",
          text: "Changelog"
        },
        {
          link: "https://github.com/orgs/vbenjs/projects/5",
          text: "Roadmap"
        },
        {
          link: "https://github.com/vbenjs/vue-vben-admin/blob/main/.github/contributing.md",
          text: "Contribution"
        }
      ]
    },
    {
      link: "/commercial/technical-support",
      text: "\u{1F984} Tech Support"
    },
    {
      link: "/sponsor/personal",
      text: "\u2728 Sponsor"
    },
    {
      link: "/commercial/community",
      text: "\u{1F468}\u200D\u{1F466}\u200D\u{1F466} Community"
    }
    // {
    //   link: '/friend-links/',
    //   text: '🤝 Friend Links',
    // },
  ];
}

// .vitepress/config/shared.mts
import { resolve } from "node:path";
import {
  viteArchiverPlugin,
  viteVxeTableImportsPlugin
} from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/internal/vite-config/dist/index.mjs";
import {
  GitChangelog,
  GitChangelogMarkdownSection
} from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/@nolebase+vitepress-plugin-git-changelog@2.18.2_vitepress@1.6.4_@algolia+client-search@_8e975699373cd17c54cc04e515e8ef2f/node_modules/@nolebase/vitepress-plugin-git-changelog/dist/vite/index.mjs";
import tailwind from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/tailwindcss@3.4.18_yaml@2.8.1/node_modules/tailwindcss/lib/index.js";
import { defineConfig as defineConfig3, postcssIsolateStyles } from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.40.1_@types+node@24.7.2_async-validator@4.2.5__88ad971b1f7e7f00245c3360ffaecd5a/node_modules/vitepress/dist/node/index.js";
import {
  groupIconMdPlugin,
  groupIconVitePlugin
} from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/vitepress-plugin-group-icons@1.6.4_markdown-it@14.1.0_vite@5.4.20_@types+node@24.7.2_le_ff125887d057152ca1a139e916522a17/node_modules/vitepress-plugin-group-icons/dist/index.js";

// .vitepress/config/plugins/demo-preview.ts
import crypto from "node:crypto";
import { readdirSync } from "node:fs";
import { join } from "node:path";
var rawPathRegexp = (
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/strict
  /^(.+?(?:\.([\da-z]+))?)(#[\w-]+)?(?: ?{(\d+(?:[,-]\d+)*)? ?(\S+)?})? ?(?:\[(.+)])?$/
);
function rawPathToToken(rawPath) {
  const [
    filepath = "",
    extension = "",
    region = "",
    lines = "",
    lang = "",
    rawTitle = ""
  ] = (rawPathRegexp.exec(rawPath) || []).slice(1);
  const title = rawTitle || filepath.split("/").pop() || "";
  return { extension, filepath, lang, lines, region, title };
}
var demoPreviewPlugin = (md) => {
  md.core.ruler.after("inline", "demo-preview", (state) => {
    const insertComponentImport = (importString) => {
      const index = state.tokens.findIndex(
        (i) => i.type === "html_block" && i.content.match(/<script setup>/g)
      );
      if (index === -1) {
        const importComponent = new state.Token("html_block", "", 0);
        importComponent.content = `<script setup>
${importString}
</script>
`;
        state.tokens.splice(0, 0, importComponent);
      } else {
        if (state.tokens[index]) {
          const content = state.tokens[index].content;
          state.tokens[index].content = content.replace(
            "</script>",
            `${importString}
</script>`
          );
        }
      }
    };
    const regex = /<DemoPreview[^>]*\sdir="([^"]*)"/g;
    state.src = state.src.replaceAll(regex, (_match, dir) => {
      const componentDir = join(process.cwd(), "src", dir).replaceAll(
        "\\",
        "/"
      );
      let childFiles = [];
      let dirExists = true;
      try {
        childFiles = readdirSync(componentDir, {
          encoding: "utf8",
          recursive: false,
          withFileTypes: false
        }) || [];
      } catch {
        dirExists = false;
      }
      if (!dirExists) {
        return "";
      }
      const uniqueWord = generateContentHash(componentDir);
      const ComponentName = `DemoComponent_${uniqueWord}`;
      insertComponentImport(
        `import ${ComponentName} from '${componentDir}/index.vue'`
      );
      const { path: _path } = state.env;
      const index = state.tokens.findIndex((i) => i.content.match(regex));
      if (!state.tokens[index]) {
        return "";
      }
      const firstString = "index.vue";
      childFiles = childFiles.sort((a, b) => {
        if (a === firstString) return -1;
        if (b === firstString) return 1;
        return a.localeCompare(b, "en", { sensitivity: "base" });
      });
      state.tokens[index].content = `<DemoPreview files="${encodeURIComponent(JSON.stringify(childFiles))}" ><${ComponentName}/>
        `;
      const _dummyToken = new state.Token("", "", 0);
      const tokenArray = [];
      childFiles.forEach((filename) => {
        const templateStart = new state.Token("html_inline", "", 0);
        templateStart.content = `<template #${filename}>`;
        tokenArray.push(templateStart);
        const resolvedPath = join(componentDir, filename);
        const { extension, filepath, lang, lines, title } = rawPathToToken(resolvedPath);
        const token = new state.Token("fence", "code", 0);
        token.info = `${lang || extension}${lines ? `{${lines}}` : ""}${title ? `[${title}]` : ""}`;
        token.content = `<<< ${filepath}`;
        token.src = [resolvedPath];
        tokenArray.push(token);
        const templateEnd = new state.Token("html_inline", "", 0);
        templateEnd.content = "</template>";
        tokenArray.push(templateEnd);
      });
      const endTag = new state.Token("html_inline", "", 0);
      endTag.content = "</DemoPreview>";
      tokenArray.push(endTag);
      state.tokens.splice(index + 1, 0, ...tokenArray);
      return "";
    });
  });
};
function generateContentHash(input, length = 10) {
  const hash = crypto.createHash("sha256").update(input).digest("hex");
  return Number.parseInt(hash, 16).toString(36).slice(0, length);
}

// .vitepress/config/zh.mts
import { defineConfig as defineConfig2 } from "file:///Applications/Personal/ModulaWorks/Projects/7ki/7ki_backend/vue-vben-admin/node_modules/.pnpm/vitepress@1.6.4_@algolia+client-search@5.40.1_@types+node@24.7.2_async-validator@4.2.5__88ad971b1f7e7f00245c3360ffaecd5a/node_modules/vitepress/dist/node/index.js";
var zh = defineConfig2({
  description: "Vben Admin & \u4F01\u4E1A\u7EA7\u7BA1\u7406\u7CFB\u7EDF\u6846\u67B6",
  lang: "zh-Hans",
  themeConfig: {
    darkModeSwitchLabel: "\u4E3B\u9898",
    darkModeSwitchTitle: "\u5207\u6362\u5230\u6DF1\u8272\u6A21\u5F0F",
    docFooter: {
      next: "\u4E0B\u4E00\u9875",
      prev: "\u4E0A\u4E00\u9875"
    },
    editLink: {
      pattern: "https://github.com/vbenjs/vue-vben-admin/edit/main/docs/src/:path",
      text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875\u9762"
    },
    footer: {
      copyright: `Copyright \xA9 2020-${(/* @__PURE__ */ new Date()).getFullYear()} Vben`,
      message: "\u57FA\u4E8E MIT \u8BB8\u53EF\u53D1\u5E03."
    },
    langMenuLabel: "\u591A\u8BED\u8A00",
    lastUpdated: {
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      },
      text: "\u6700\u540E\u66F4\u65B0\u4E8E"
    },
    lightModeSwitchTitle: "\u5207\u6362\u5230\u6D45\u8272\u6A21\u5F0F",
    nav: nav2(),
    outline: {
      label: "\u9875\u9762\u5BFC\u822A"
    },
    returnToTopLabel: "\u56DE\u5230\u9876\u90E8",
    sidebar: {
      "/commercial/": { base: "/commercial/", items: sidebarCommercial2() },
      "/components/": { base: "/components/", items: sidebarComponents() },
      "/guide/": { base: "/guide/", items: sidebarGuide2() }
    },
    sidebarMenuLabel: "\u83DC\u5355"
  }
});
function sidebarGuide2() {
  return [
    {
      collapsed: false,
      text: "\u7B80\u4ECB",
      items: [
        {
          link: "introduction/vben",
          text: "\u5173\u4E8E Vben Admin"
        },
        {
          link: "introduction/why",
          text: "\u4E3A\u4EC0\u4E48\u9009\u62E9\u6211\u4EEC?"
        },
        { link: "introduction/quick-start", text: "\u5FEB\u901F\u5F00\u59CB" },
        { link: "introduction/thin", text: "\u7CBE\u7B80\u7248\u672C" },
        {
          base: "/",
          link: "components/introduction",
          text: "\u7EC4\u4EF6\u6587\u6863"
        }
      ]
    },
    {
      text: "\u57FA\u7840",
      items: [
        { link: "essentials/concept", text: "\u57FA\u7840\u6982\u5FF5" },
        { link: "essentials/development", text: "\u672C\u5730\u5F00\u53D1" },
        { link: "essentials/route", text: "\u8DEF\u7531\u548C\u83DC\u5355" },
        { link: "essentials/settings", text: "\u914D\u7F6E" },
        { link: "essentials/icons", text: "\u56FE\u6807" },
        { link: "essentials/styles", text: "\u6837\u5F0F" },
        { link: "essentials/external-module", text: "\u5916\u90E8\u6A21\u5757" },
        { link: "essentials/build", text: "\u6784\u5EFA\u4E0E\u90E8\u7F72" },
        { link: "essentials/server", text: "\u670D\u52A1\u7AEF\u4EA4\u4E92\u4E0E\u6570\u636EMock" }
      ]
    },
    {
      text: "\u6DF1\u5165",
      items: [
        { link: "in-depth/login", text: "\u767B\u5F55" },
        // { link: 'in-depth/layout', text: '布局' },
        { link: "in-depth/theme", text: "\u4E3B\u9898" },
        { link: "in-depth/access", text: "\u6743\u9650" },
        { link: "in-depth/locale", text: "\u56FD\u9645\u5316" },
        { link: "in-depth/features", text: "\u5E38\u7528\u529F\u80FD" },
        { link: "in-depth/check-updates", text: "\u68C0\u67E5\u66F4\u65B0" },
        { link: "in-depth/loading", text: "\u5168\u5C40loading" },
        { link: "in-depth/ui-framework", text: "\u7EC4\u4EF6\u5E93\u5207\u6362" }
      ]
    },
    {
      text: "\u5DE5\u7A0B",
      items: [
        { link: "project/standard", text: "\u89C4\u8303" },
        { link: "project/cli", text: "CLI" },
        { link: "project/dir", text: "\u76EE\u5F55\u8BF4\u660E" },
        { link: "project/test", text: "\u5355\u5143\u6D4B\u8BD5" },
        { link: "project/tailwindcss", text: "Tailwind CSS" },
        { link: "project/changeset", text: "Changeset" },
        { link: "project/vite", text: "Vite Config" }
      ]
    },
    {
      text: "\u5176\u4ED6",
      items: [
        { link: "other/project-update", text: "\u9879\u76EE\u66F4\u65B0" },
        { link: "other/remove-code", text: "\u79FB\u9664\u4EE3\u7801" },
        { link: "other/faq", text: "\u5E38\u89C1\u95EE\u9898" }
      ]
    }
  ];
}
function sidebarCommercial2() {
  return [
    {
      link: "community",
      text: "\u4EA4\u6D41\u7FA4"
    },
    {
      link: "technical-support",
      text: "\u6280\u672F\u652F\u6301"
    },
    {
      link: "customized",
      text: "\u5B9A\u5236\u5F00\u53D1"
    }
  ];
}
function sidebarComponents() {
  return [
    {
      text: "\u7EC4\u4EF6",
      items: [
        {
          link: "introduction",
          text: "\u4ECB\u7ECD"
        }
      ]
    },
    {
      collapsed: false,
      text: "\u5E03\u5C40\u7EC4\u4EF6",
      items: [
        {
          link: "layout-ui/page",
          text: "Page \u9875\u9762"
        }
      ]
    },
    {
      collapsed: false,
      text: "\u901A\u7528\u7EC4\u4EF6",
      items: [
        {
          link: "common-ui/vben-api-component",
          text: "ApiComponent Api\u7EC4\u4EF6\u5305\u88C5\u5668"
        },
        {
          link: "common-ui/vben-alert",
          text: "Alert \u8F7B\u91CF\u63D0\u793A\u6846"
        },
        {
          link: "common-ui/vben-modal",
          text: "Modal \u6A21\u6001\u6846"
        },
        {
          link: "common-ui/vben-drawer",
          text: "Drawer \u62BD\u5C49"
        },
        {
          link: "common-ui/vben-form",
          text: "Form \u8868\u5355"
        },
        {
          link: "common-ui/vben-vxe-table",
          text: "Vxe Table \u8868\u683C"
        },
        {
          link: "common-ui/vben-count-to-animator",
          text: "CountToAnimator \u6570\u5B57\u52A8\u753B"
        },
        {
          link: "common-ui/vben-ellipsis-text",
          text: "EllipsisText \u7701\u7565\u6587\u672C"
        }
      ]
    }
  ];
}
function nav2() {
  return [
    {
      activeMatch: "^/(guide|components)/",
      text: "\u6587\u6863",
      items: [
        {
          activeMatch: "^/guide/",
          link: "/guide/introduction/vben",
          text: "\u6307\u5357"
        },
        {
          activeMatch: "^/components/",
          link: "/components/introduction",
          text: "\u7EC4\u4EF6"
        },
        {
          text: "\u5386\u53F2\u7248\u672C",
          items: [
            {
              link: "https://doc.vvbin.cn",
              text: "2.x\u7248\u672C\u6587\u6863"
            }
          ]
        }
      ]
    },
    {
      text: "\u6F14\u793A",
      items: [
        {
          text: "Vben Admin",
          items: [
            {
              link: "https://www.vben.pro",
              text: "\u6F14\u793A\u7248\u672C"
            },
            {
              link: "https://ant.vben.pro",
              text: "Ant Design Vue \u7248\u672C"
            },
            {
              link: "https://naive.vben.pro",
              text: "Naive \u7248\u672C"
            },
            {
              link: "https://ele.vben.pro",
              text: "Element Plus\u7248\u672C"
            }
          ]
        },
        {
          text: "\u5176\u4ED6",
          items: [
            {
              link: "https://vben.vvbin.cn",
              text: "Vben Admin 2.x"
            }
          ]
        }
      ]
    },
    {
      text: version,
      items: [
        {
          link: "https://github.com/vbenjs/vue-vben-admin/releases",
          text: "\u66F4\u65B0\u65E5\u5FD7"
        },
        {
          link: "https://github.com/orgs/vbenjs/projects/5",
          text: "\u8DEF\u7EBF\u56FE"
        },
        {
          link: "https://github.com/vbenjs/vue-vben-admin/blob/main/.github/contributing.md",
          text: "\u8D21\u732E"
        }
      ]
    },
    {
      link: "/commercial/technical-support",
      text: "\u{1F984} \u6280\u672F\u652F\u6301"
    },
    {
      link: "/sponsor/personal",
      text: "\u2728 \u8D5E\u52A9"
    },
    {
      link: "/commercial/community",
      text: "\u{1F468}\u200D\u{1F466}\u200D\u{1F466} \u4EA4\u6D41\u7FA4"
      // items: [
      //   {
      //     link: 'https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&appChannel=share&inviteCode=22ySzj7pKiw&businessType=9&from=246610&biz=ka&mainSourceId=share&subSourceId=others&jumpsource=shorturl#/pc',
      //     text: 'QQ频道',
      //   },
      //   {
      //     link: 'https://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=mjZmlhgVzzUxvdxllB6C1vHpX8O8QRL0&authKey=DBdFbBwERmfaKY95JvRWqLCJIRGJAmKyZbrpzZ41EKDMZ5SR6MfbjOBaaNRN73fr&noverify=0&group_code=4286109',
      //     text: 'QQ群',
      //   },
      //   {
      //     link: 'https://discord.gg/VU62jTecad',
      //     text: 'Discord',
      //   },
      // ],
    }
    // {
    //   link: '/friend-links/',
    //   text: '🤝 友情链接',
    // },
  ];
}
var search = {
  root: {
    placeholder: "\u641C\u7D22\u6587\u6863",
    translations: {
      button: {
        buttonAriaLabel: "\u641C\u7D22\u6587\u6863",
        buttonText: "\u641C\u7D22\u6587\u6863"
      },
      modal: {
        errorScreen: {
          helpText: "\u4F60\u53EF\u80FD\u9700\u8981\u68C0\u67E5\u4F60\u7684\u7F51\u7EDC\u8FDE\u63A5",
          titleText: "\u65E0\u6CD5\u83B7\u53D6\u7ED3\u679C"
        },
        footer: {
          closeText: "\u5173\u95ED",
          navigateText: "\u5207\u6362",
          searchByText: "\u641C\u7D22\u63D0\u4F9B\u8005",
          selectText: "\u9009\u62E9"
        },
        noResultsScreen: {
          noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
          reportMissingResultsLinkText: "\u70B9\u51FB\u53CD\u9988",
          reportMissingResultsText: "\u4F60\u8BA4\u4E3A\u8BE5\u67E5\u8BE2\u5E94\u8BE5\u6709\u7ED3\u679C\uFF1F",
          suggestedQueryText: "\u4F60\u53EF\u4EE5\u5C1D\u8BD5\u67E5\u8BE2"
        },
        searchBox: {
          cancelButtonAriaLabel: "\u53D6\u6D88",
          cancelButtonText: "\u53D6\u6D88",
          resetButtonAriaLabel: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
          resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6"
        },
        startScreen: {
          favoriteSearchesTitle: "\u6536\u85CF",
          noRecentSearchesText: "\u6CA1\u6709\u641C\u7D22\u5386\u53F2",
          recentSearchesTitle: "\u641C\u7D22\u5386\u53F2",
          removeFavoriteSearchButtonTitle: "\u4ECE\u6536\u85CF\u4E2D\u79FB\u9664",
          removeRecentSearchButtonTitle: "\u4ECE\u641C\u7D22\u5386\u53F2\u4E2D\u79FB\u9664",
          saveRecentSearchButtonTitle: "\u4FDD\u5B58\u81F3\u641C\u7D22\u5386\u53F2"
        }
      }
    }
  }
};

// .vitepress/config/shared.mts
var shared = defineConfig3({
  appearance: "dark",
  head: head(),
  markdown: {
    preConfig(md) {
      md.use(demoPreviewPlugin);
      md.use(groupIconMdPlugin);
    }
  },
  pwa: pwa(),
  srcDir: "src",
  themeConfig: {
    i18nRouting: true,
    logo: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp",
    search: {
      options: {
        locales: {
          ...search
        }
      },
      provider: "local"
    },
    siteTitle: "Vben Admin",
    socialLinks: [
      { icon: "github", link: "https://github.com/vbenjs/vue-vben-admin" }
    ]
  },
  title: "Vben Admin",
  vite: {
    build: {
      chunkSizeWarningLimit: Infinity,
      minify: "terser"
    },
    css: {
      postcss: {
        plugins: [
          tailwind(),
          postcssIsolateStyles({ includeFiles: [/vp-doc\.css/] })
        ]
      },
      preprocessorOptions: {
        scss: {
          api: "modern"
        }
      }
    },
    json: {
      stringify: true
    },
    plugins: [
      GitChangelog({
        mapAuthors: [
          {
            mapByNameAliases: ["Vben"],
            name: "vben",
            username: "anncwb"
          },
          {
            name: "vince",
            username: "vince292007"
          },
          {
            name: "Li Kui",
            username: "likui628"
          }
        ],
        repoURL: () => "https://github.com/vbenjs/vue-vben-admin"
      }),
      GitChangelogMarkdownSection(),
      viteArchiverPlugin({ outputDir: ".vitepress" }),
      groupIconVitePlugin(),
      await viteVxeTableImportsPlugin()
    ],
    server: {
      fs: {
        allow: ["../.."]
      },
      host: true,
      port: 6173
    },
    ssr: {
      external: ["@vue/repl"]
    }
  }
});
function head() {
  return [
    ["meta", { content: "Vbenjs Team", name: "author" }],
    [
      "meta",
      {
        content: "vben, vitejs, vite, shacdn-ui, vue",
        name: "keywords"
      }
    ],
    ["link", { href: "/favicon.ico", rel: "icon", type: "image/svg+xml" }],
    [
      "meta",
      {
        content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
        name: "viewport"
      }
    ],
    ["meta", { content: "vben admin docs", name: "keywords" }],
    ["link", { href: "/favicon.ico", rel: "icon" }]
    // [
    //   'script',
    //   {
    //     src: 'https://cdn.tailwindcss.com',
    //   },
    // ],
  ];
}
function pwa() {
  return {
    includeManifestIcons: false,
    manifest: {
      description: "Vben Admin is a modern admin dashboard template based on Vue 3. ",
      icons: [
        {
          sizes: "192x192",
          src: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-192.png",
          type: "image/png"
        },
        {
          sizes: "512x512",
          src: "https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-512.png",
          type: "image/png"
        }
      ],
      id: "/",
      name: "Vben Admin Doc",
      short_name: "vben_admin_doc",
      theme_color: "#ffffff"
    },
    outDir: resolve(process.cwd(), ".vitepress/dist"),
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
    }
  };
}

// .vitepress/config/index.mts
var index_default = withPwa(
  defineConfigWithTheme({
    ...shared,
    locales: {
      en: {
        label: "English",
        lang: "en",
        link: "/en/",
        ...en
      },
      root: {
        label: "\u7B80\u4F53\u4E2D\u6587",
        lang: "zh-CN",
        ...zh
      }
    }
  })
);
export {
  index_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcvaW5kZXgubXRzIiwgIi52aXRlcHJlc3MvY29uZmlnL2VuLm10cyIsICIuLi9wYWNrYWdlLmpzb24iLCAiLnZpdGVwcmVzcy9jb25maWcvc2hhcmVkLm10cyIsICIudml0ZXByZXNzL2NvbmZpZy9wbHVnaW5zL2RlbW8tcHJldmlldy50cyIsICIudml0ZXByZXNzL2NvbmZpZy96aC5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2luZGV4Lm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2luZGV4Lm10c1wiO2ltcG9ydCB7IHdpdGhQd2EgfSBmcm9tICdAdml0ZS1wd2Evdml0ZXByZXNzJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZ1dpdGhUaGVtZSB9IGZyb20gJ3ZpdGVwcmVzcyc7XG5cbmltcG9ydCB7IGVuIH0gZnJvbSAnLi9lbi5tdHMnO1xuaW1wb3J0IHsgc2hhcmVkIH0gZnJvbSAnLi9zaGFyZWQubXRzJztcbmltcG9ydCB7IHpoIH0gZnJvbSAnLi96aC5tdHMnO1xuXG5leHBvcnQgZGVmYXVsdCB3aXRoUHdhKFxuICBkZWZpbmVDb25maWdXaXRoVGhlbWUoe1xuICAgIC4uLnNoYXJlZCxcbiAgICBsb2NhbGVzOiB7XG4gICAgICBlbjoge1xuICAgICAgICBsYWJlbDogJ0VuZ2xpc2gnLFxuICAgICAgICBsYW5nOiAnZW4nLFxuICAgICAgICBsaW5rOiAnL2VuLycsXG4gICAgICAgIC4uLmVuLFxuICAgICAgfSxcbiAgICAgIHJvb3Q6IHtcbiAgICAgICAgbGFiZWw6ICdcdTdCODBcdTRGNTNcdTRFMkRcdTY1ODcnLFxuICAgICAgICBsYW5nOiAnemgtQ04nLFxuICAgICAgICAuLi56aCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSksXG4pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2VuLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL2VuLm10c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBjb25zdCBlbiA9IGRlZmluZUNvbmZpZyh7XG4gIGRlc2NyaXB0aW9uOiAnVmJlbiBBZG1pbiAmIEVudGVycHJpc2UgbGV2ZWwgbWFuYWdlbWVudCBzeXN0ZW0gZnJhbWV3b3JrJyxcbiAgbGFuZzogJ2VuLVVTJyxcbiAgdGhlbWVDb25maWc6IHtcbiAgICBkYXJrTW9kZVN3aXRjaExhYmVsOiAnVGhlbWUnLFxuICAgIGRhcmtNb2RlU3dpdGNoVGl0bGU6ICdTd2l0Y2ggdG8gRGFyayBNb2RlJyxcbiAgICBkb2NGb290ZXI6IHtcbiAgICAgIG5leHQ6ICdOZXh0IFBhZ2UnLFxuICAgICAgcHJldjogJ1ByZXZpb3VzIFBhZ2UnLFxuICAgIH0sXG4gICAgZWRpdExpbms6IHtcbiAgICAgIHBhdHRlcm46XG4gICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluL2VkaXQvbWFpbi9kb2NzL3NyYy86cGF0aCcsXG4gICAgICB0ZXh0OiAnRWRpdCB0aGlzIHBhZ2Ugb24gR2l0SHViJyxcbiAgICB9LFxuICAgIGZvb3Rlcjoge1xuICAgICAgY29weXJpZ2h0OiBgQ29weXJpZ2h0IFx1MDBBOSAyMDIwLSR7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSBWYmVuYCxcbiAgICAgIG1lc3NhZ2U6ICdSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuJyxcbiAgICB9LFxuICAgIGxhbmdNZW51TGFiZWw6ICdMYW5ndWFnZScsXG4gICAgbGFzdFVwZGF0ZWQ6IHtcbiAgICAgIGZvcm1hdE9wdGlvbnM6IHtcbiAgICAgICAgZGF0ZVN0eWxlOiAnc2hvcnQnLFxuICAgICAgICB0aW1lU3R5bGU6ICdtZWRpdW0nLFxuICAgICAgfSxcbiAgICAgIHRleHQ6ICdMYXN0IHVwZGF0ZWQgb24nLFxuICAgIH0sXG4gICAgbGlnaHRNb2RlU3dpdGNoVGl0bGU6ICdTd2l0Y2ggdG8gTGlnaHQgTW9kZScsXG4gICAgbmF2OiBuYXYoKSxcbiAgICBvdXRsaW5lOiB7XG4gICAgICBsYWJlbDogJ05hdmlnYXRlJyxcbiAgICB9LFxuICAgIHJldHVyblRvVG9wTGFiZWw6ICdCYWNrIHRvIHRvcCcsXG4gICAgc2lkZWJhcjoge1xuICAgICAgJy9lbi9jb21tZXJjaWFsLyc6IHtcbiAgICAgICAgYmFzZTogJy9lbi9jb21tZXJjaWFsLycsXG4gICAgICAgIGl0ZW1zOiBzaWRlYmFyQ29tbWVyY2lhbCgpLFxuICAgICAgfSxcbiAgICAgICcvZW4vZ3VpZGUvJzogeyBiYXNlOiAnL2VuL2d1aWRlLycsIGl0ZW1zOiBzaWRlYmFyR3VpZGUoKSB9LFxuICAgIH0sXG4gIH0sXG59KTtcblxuZnVuY3Rpb24gc2lkZWJhckd1aWRlKCk6IERlZmF1bHRUaGVtZS5TaWRlYmFySXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgdGV4dDogJ0ludHJvZHVjdGlvbicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2ludHJvZHVjdGlvbi92YmVuJyxcbiAgICAgICAgICB0ZXh0OiAnQWJvdXQgVmJlbiBBZG1pbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnaW50cm9kdWN0aW9uL3doeScsXG4gICAgICAgICAgdGV4dDogJ1doeSBDaG9vc2UgVXM/JyxcbiAgICAgICAgfSxcbiAgICAgICAgeyBsaW5rOiAnaW50cm9kdWN0aW9uL3F1aWNrLXN0YXJ0JywgdGV4dDogJ1F1aWNrIFN0YXJ0JyB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vdGhpbicsIHRleHQ6ICdMaXRlIFZlcnNpb24nIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ0Jhc2ljcycsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL2NvbmNlcHQnLCB0ZXh0OiAnQmFzaWMgQ29uY2VwdHMnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZGV2ZWxvcG1lbnQnLCB0ZXh0OiAnTG9jYWwgRGV2ZWxvcG1lbnQnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvcm91dGUnLCB0ZXh0OiAnUm91dGluZyBhbmQgTWVudScgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9zZXR0aW5ncycsIHRleHQ6ICdDb25maWd1cmF0aW9uJyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL2ljb25zJywgdGV4dDogJ0ljb25zJyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3N0eWxlcycsIHRleHQ6ICdTdHlsZXMnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZXh0ZXJuYWwtbW9kdWxlJywgdGV4dDogJ0V4dGVybmFsIE1vZHVsZXMnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvYnVpbGQnLCB0ZXh0OiAnQnVpbGQgYW5kIERlcGxveW1lbnQnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvc2VydmVyJywgdGV4dDogJ1NlcnZlciBJbnRlcmFjdGlvbiBhbmQgRGF0YSBNb2NrJyB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdBZHZhbmNlZCcsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9sb2dpbicsIHRleHQ6ICdMb2dpbicgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvdGhlbWUnLCB0ZXh0OiAnVGhlbWUnIH0sXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL2FjY2VzcycsIHRleHQ6ICdBY2Nlc3MgQ29udHJvbCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9jYWxlJywgdGV4dDogJ0ludGVybmF0aW9uYWxpemF0aW9uJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9mZWF0dXJlcycsIHRleHQ6ICdDb21tb24gRmVhdHVyZXMnIH0sXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL2NoZWNrLXVwZGF0ZXMnLCB0ZXh0OiAnQ2hlY2sgVXBkYXRlcycgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9hZGluZycsIHRleHQ6ICdHbG9iYWwgTG9hZGluZycgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvdWktZnJhbWV3b3JrJywgdGV4dDogJ1VJIEZyYW1ld29yayBTd2l0Y2hpbmcnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ0VuZ2luZWVyaW5nJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGluazogJ3Byb2plY3Qvc3RhbmRhcmQnLCB0ZXh0OiAnU3RhbmRhcmRzJyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L2NsaScsIHRleHQ6ICdDTEknIH0sXG4gICAgICAgIHsgbGluazogJ3Byb2plY3QvZGlyJywgdGV4dDogJ0RpcmVjdG9yeSBFeHBsYW5hdGlvbicgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC90ZXN0JywgdGV4dDogJ1VuaXQgVGVzdGluZycgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC90YWlsd2luZGNzcycsIHRleHQ6ICdUYWlsd2luZCBDU1MnIH0sXG4gICAgICAgIHsgbGluazogJ3Byb2plY3QvY2hhbmdlc2V0JywgdGV4dDogJ0NoYW5nZXNldCcgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC92aXRlJywgdGV4dDogJ1ZpdGUgQ29uZmlnJyB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdPdGhlcnMnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsaW5rOiAnb3RoZXIvcHJvamVjdC11cGRhdGUnLCB0ZXh0OiAnUHJvamVjdCBVcGRhdGUnIH0sXG4gICAgICAgIHsgbGluazogJ290aGVyL3JlbW92ZS1jb2RlJywgdGV4dDogJ1JlbW92ZSBDb2RlJyB9LFxuICAgICAgICB7IGxpbms6ICdvdGhlci9mYXEnLCB0ZXh0OiAnRkFRJyB9LFxuICAgICAgXSxcbiAgICB9LFxuICBdO1xufVxuXG5mdW5jdGlvbiBzaWRlYmFyQ29tbWVyY2lhbCgpOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbGluazogJ2NvbW11bml0eScsXG4gICAgICB0ZXh0OiAnQ29tbXVuaXR5JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxpbms6ICd0ZWNobmljYWwtc3VwcG9ydCcsXG4gICAgICB0ZXh0OiAnVGVjaG5pY2FsLXN1cHBvcnQnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGluazogJ2N1c3RvbWl6ZWQnLFxuICAgICAgdGV4dDogJ0N1c3RvbWl6ZWQnLFxuICAgIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIG5hdigpOiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBhY3RpdmVNYXRjaDogJ14vZW4vKGd1aWRlfGNvbXBvbmVudHMpLycsXG4gICAgICB0ZXh0OiAnRG9jJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpdmVNYXRjaDogJ14vZW4vZ3VpZGUvJyxcbiAgICAgICAgICBsaW5rOiAnL2VuL2d1aWRlL2ludHJvZHVjdGlvbi92YmVuJyxcbiAgICAgICAgICB0ZXh0OiAnR3VpZGUnLFxuICAgICAgICB9LFxuICAgICAgICAvLyB7XG4gICAgICAgIC8vICAgYWN0aXZlTWF0Y2g6ICdeL2VuL2NvbXBvbmVudHMvJyxcbiAgICAgICAgLy8gICBsaW5rOiAnL2VuL2NvbXBvbmVudHMvaW50cm9kdWN0aW9uJyxcbiAgICAgICAgLy8gICB0ZXh0OiAnQ29tcG9uZW50cycsXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnSGlzdG9yaWNhbCBWZXJzaW9ucycsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vZG9jLnZ2YmluLmNuJyxcbiAgICAgICAgICAgICAgdGV4dDogJzIueCBWZXJzaW9uIERvY3VtZW50YXRpb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdEZW1vJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnVmJlbiBBZG1pbicsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vd3d3LnZiZW4ucHJvJyxcbiAgICAgICAgICAgICAgdGV4dDogJ0RlbW8gVmVyc2lvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9hbnQudmJlbi5wcm8nLFxuICAgICAgICAgICAgICB0ZXh0OiAnQW50IERlc2lnbiBWdWUgVmVyc2lvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9uYWl2ZS52YmVuLnBybycsXG4gICAgICAgICAgICAgIHRleHQ6ICdOYWl2ZSBWZXJzaW9uJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxpbms6ICdodHRwczovL2VsZS52YmVuLnBybycsXG4gICAgICAgICAgICAgIHRleHQ6ICdFbGVtZW50IFBsdXMgVmVyc2lvbicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnT3RoZXJzJyxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly92YmVuLnZ2YmluLmNuJyxcbiAgICAgICAgICAgICAgdGV4dDogJ1ZiZW4gQWRtaW4gMi54JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiB2ZXJzaW9uLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluL3JlbGVhc2VzJyxcbiAgICAgICAgICB0ZXh0OiAnQ2hhbmdlbG9nJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vb3Jncy92YmVuanMvcHJvamVjdHMvNScsXG4gICAgICAgICAgdGV4dDogJ1JvYWRtYXAnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW4vYmxvYi9tYWluLy5naXRodWIvY29udHJpYnV0aW5nLm1kJyxcbiAgICAgICAgICB0ZXh0OiAnQ29udHJpYnV0aW9uJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnL2NvbW1lcmNpYWwvdGVjaG5pY2FsLXN1cHBvcnQnLFxuICAgICAgdGV4dDogJ1x1RDgzRVx1REQ4NCBUZWNoIFN1cHBvcnQnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGluazogJy9zcG9uc29yL3BlcnNvbmFsJyxcbiAgICAgIHRleHQ6ICdcdTI3MjggU3BvbnNvcicsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnL2NvbW1lcmNpYWwvY29tbXVuaXR5JyxcbiAgICAgIHRleHQ6ICdcdUQ4M0RcdURDNjhcdTIwMERcdUQ4M0RcdURDNjZcdTIwMERcdUQ4M0RcdURDNjYgQ29tbXVuaXR5JyxcbiAgICB9LFxuICAgIC8vIHtcbiAgICAvLyAgIGxpbms6ICcvZnJpZW5kLWxpbmtzLycsXG4gICAgLy8gICB0ZXh0OiAnXHVEODNFXHVERDFEIEZyaWVuZCBMaW5rcycsXG4gICAgLy8gfSxcbiAgXTtcbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcInZiZW4tYWRtaW4tbW9ub3JlcG9cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiNS41LjdcIixcbiAgXCJwcml2YXRlXCI6IHRydWUsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwibW9ub3JlcG9cIixcbiAgICBcInR1cmJvXCIsXG4gICAgXCJ2YmVuXCIsXG4gICAgXCJ2YmVuIGFkbWluXCIsXG4gICAgXCJ2YmVuIHByb1wiLFxuICAgIFwidnVlXCIsXG4gICAgXCJ2dWUgYWRtaW5cIixcbiAgICBcInZ1ZSB2YmVuIGFkbWluXCIsXG4gICAgXCJ2dWUgdmJlbiBhZG1pbiBwcm9cIixcbiAgICBcInZ1ZTNcIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3ZiZW5qcy92dWUtdmJlbi1hZG1pblwiLFxuICBcImJ1Z3NcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluL2lzc3Vlc1wiLFxuICBcInJlcG9zaXRvcnlcIjogXCJ2YmVuanMvdnVlLXZiZW4tYWRtaW4uZ2l0XCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcImF1dGhvclwiOiB7XG4gICAgXCJuYW1lXCI6IFwidmJlblwiLFxuICAgIFwiZW1haWxcIjogXCJhbm4udmJlbkBnbWFpbC5jb21cIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2JcIlxuICB9LFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1aWxkXCI6IFwiY3Jvc3MtZW52IE5PREVfT1BUSU9OUz0tLW1heC1vbGQtc3BhY2Utc2l6ZT04MTkyIHR1cmJvIGJ1aWxkXCIsXG4gICAgXCJidWlsZDphbmFseXplXCI6IFwidHVyYm8gYnVpbGQ6YW5hbHl6ZVwiLFxuICAgIFwiYnVpbGQ6YW50ZFwiOiBcInBucG0gcnVuIGJ1aWxkIC0tZmlsdGVyPUB2YmVuL3dlYi1hbnRkXCIsXG4gICAgXCJidWlsZDpkb2NrZXJcIjogXCIuL3NjcmlwdHMvZGVwbG95L2J1aWxkLWxvY2FsLWRvY2tlci1pbWFnZS5zaFwiLFxuICAgIFwiYnVpbGQ6ZG9jc1wiOiBcInBucG0gcnVuIGJ1aWxkIC0tZmlsdGVyPUB2YmVuL2RvY3NcIixcbiAgICBcImJ1aWxkOmVsZVwiOiBcInBucG0gcnVuIGJ1aWxkIC0tZmlsdGVyPUB2YmVuL3dlYi1lbGVcIixcbiAgICBcImJ1aWxkOm5haXZlXCI6IFwicG5wbSBydW4gYnVpbGQgLS1maWx0ZXI9QHZiZW4vd2ViLW5haXZlXCIsXG4gICAgXCJidWlsZDpwbGF5XCI6IFwicG5wbSBydW4gYnVpbGQgLS1maWx0ZXI9QHZiZW4vcGxheWdyb3VuZFwiLFxuICAgIFwiY2hhbmdlc2V0XCI6IFwicG5wbSBleGVjIGNoYW5nZXNldFwiLFxuICAgIFwiY2hlY2tcIjogXCJwbnBtIHJ1biBjaGVjazpjaXJjdWxhciAmJiBwbnBtIHJ1biBjaGVjazpkZXAgJiYgcG5wbSBydW4gY2hlY2s6dHlwZSAmJiBwbnBtIGNoZWNrOmNzcGVsbFwiLFxuICAgIFwiY2hlY2s6Y2lyY3VsYXJcIjogXCJ2c2ggY2hlY2stY2lyY3VsYXJcIixcbiAgICBcImNoZWNrOmNzcGVsbFwiOiBcImNzcGVsbCBsaW50ICoqLyoudHMgKiovUkVBRE1FLm1kIC5jaGFuZ2VzZXQvKi5tZCAtLW5vLXByb2dyZXNzXCIsXG4gICAgXCJjaGVjazpkZXBcIjogXCJ2c2ggY2hlY2stZGVwXCIsXG4gICAgXCJjaGVjazp0eXBlXCI6IFwidHVyYm8gcnVuIHR5cGVjaGVja1wiLFxuICAgIFwiY2xlYW5cIjogXCJub2RlIC4vc2NyaXB0cy9jbGVhbi5tanNcIixcbiAgICBcImNvbW1pdFwiOiBcImN6Z1wiLFxuICAgIFwiZGV2XCI6IFwidHVyYm8tcnVuIGRldlwiLFxuICAgIFwiZGV2OmFudGRcIjogXCJwbnBtIC1GIEB2YmVuL3dlYi1hbnRkIHJ1biBkZXZcIixcbiAgICBcImRldjpkb2NzXCI6IFwicG5wbSAtRiBAdmJlbi9kb2NzIHJ1biBkZXZcIixcbiAgICBcImRldjplbGVcIjogXCJwbnBtIC1GIEB2YmVuL3dlYi1lbGUgcnVuIGRldlwiLFxuICAgIFwiZGV2Om5haXZlXCI6IFwicG5wbSAtRiBAdmJlbi93ZWItbmFpdmUgcnVuIGRldlwiLFxuICAgIFwiZGV2OnBsYXlcIjogXCJwbnBtIC1GIEB2YmVuL3BsYXlncm91bmQgcnVuIGRldlwiLFxuICAgIFwiZm9ybWF0XCI6IFwidnNoIGxpbnQgLS1mb3JtYXRcIixcbiAgICBcImxpbnRcIjogXCJ2c2ggbGludFwiLFxuICAgIFwicG9zdGluc3RhbGxcIjogXCJwbnBtIC1yIHJ1biBzdHViIC0taWYtcHJlc2VudFwiLFxuICAgIFwicHJlaW5zdGFsbFwiOiBcIm5weCBvbmx5LWFsbG93IHBucG1cIixcbiAgICBcInByZXZpZXdcIjogXCJ0dXJiby1ydW4gcHJldmlld1wiLFxuICAgIFwicHVibGludFwiOiBcInZzaCBwdWJsaW50XCIsXG4gICAgXCJyZWluc3RhbGxcIjogXCJwbnBtIGNsZWFuIC0tZGVsLWxvY2sgJiYgcG5wbSBpbnN0YWxsXCIsXG4gICAgXCJ0ZXN0OnVuaXRcIjogXCJ2aXRlc3QgcnVuIC0tZG9tXCIsXG4gICAgXCJ0ZXN0OmUyZVwiOiBcInR1cmJvIHJ1biB0ZXN0OmUyZVwiLFxuICAgIFwidXBkYXRlOmRlcHNcIjogXCJucHggdGF6ZSAtciAtd1wiLFxuICAgIFwidmVyc2lvblwiOiBcInBucG0gZXhlYyBjaGFuZ2VzZXQgdmVyc2lvbiAmJiBwbnBtIGluc3RhbGwgLS1uby1mcm96ZW4tbG9ja2ZpbGVcIixcbiAgICBcImNhdGFsb2dcIjogXCJwbnB4IGNvZGVtb2QgcG5wbS9jYXRhbG9nXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGNoYW5nZXNldHMvY2hhbmdlbG9nLWdpdGh1YlwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJAY2hhbmdlc2V0cy9jbGlcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwiQHBsYXl3cmlnaHQvdGVzdFwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJAdmJlbi9jb21taXRsaW50LWNvbmZpZ1wiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi9lc2xpbnQtY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL3ByZXR0aWVyLWNvbmZpZ1wiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi9zdHlsZWxpbnQtY29uZmlnXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2YmVuL3RhaWx3aW5kLWNvbmZpZ1wiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi90c2NvbmZpZ1wiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAdmJlbi90dXJiby1ydW5cIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQHZiZW4vdml0ZS1jb25maWdcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQHZiZW4vdnNoXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcIkB2dWUvdGVzdC11dGlsc1wiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJhdXRvcHJlZml4ZXJcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwiY3Jvc3MtZW52XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcImNzcGVsbFwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJoYXBweS1kb21cIjogXCJjYXRhbG9nOlwiLFxuICAgIFwiaXMtY2lcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwibGVmdGhvb2tcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwicGxheXdyaWdodFwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJyaW1yYWZcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidHVyYm9cIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ1bmJ1aWxkXCI6IFwiY2F0YWxvZzpcIixcbiAgICBcInZpdGVcIjogXCJjYXRhbG9nOlwiLFxuICAgIFwidml0ZXN0XCI6IFwiY2F0YWxvZzpcIixcbiAgICBcInZ1ZVwiOiBcImNhdGFsb2c6XCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiY2F0YWxvZzpcIlxuICB9LFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49MjAuMTAuMFwiLFxuICAgIFwicG5wbVwiOiBcIj49OS4xMi4wXCJcbiAgfSxcbiAgXCJwYWNrYWdlTWFuYWdlclwiOiBcInBucG1AMTAuMTIuNFwiLFxuICBcInBucG1cIjoge1xuICAgIFwicGVlckRlcGVuZGVuY3lSdWxlc1wiOiB7XG4gICAgICBcImFsbG93ZWRWZXJzaW9uc1wiOiB7XG4gICAgICAgIFwiZXNsaW50XCI6IFwiKlwiXG4gICAgICB9XG4gICAgfSxcbiAgICBcIm92ZXJyaWRlc1wiOiB7XG4gICAgICBcIkBhc3QtZ3JlcC9uYXBpXCI6IFwiY2F0YWxvZzpcIixcbiAgICAgIFwiQGN0cmwvdGlueWNvbG9yXCI6IFwiY2F0YWxvZzpcIixcbiAgICAgIFwiY2xzeFwiOiBcImNhdGFsb2c6XCIsXG4gICAgICBcImVzYnVpbGRcIjogXCIwLjI1LjNcIixcbiAgICAgIFwicGluaWFcIjogXCJjYXRhbG9nOlwiLFxuICAgICAgXCJ2dWVcIjogXCJjYXRhbG9nOlwiXG4gICAgfSxcbiAgICBcIm5ldmVyQnVpbHREZXBlbmRlbmNpZXNcIjogW1xuICAgICAgXCJjYW52YXNcIixcbiAgICAgIFwibm9kZS1neXBcIlxuICAgIF1cbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3NoYXJlZC5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0FwcGxpY2F0aW9ucy9QZXJzb25hbC9Nb2R1bGFXb3Jrcy9Qcm9qZWN0cy83a2kvN2tpX2JhY2tlbmQvdnVlLXZiZW4tYWRtaW4vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9zaGFyZWQubXRzXCI7aW1wb3J0IHR5cGUgeyBQd2FPcHRpb25zIH0gZnJvbSAnQHZpdGUtcHdhL3ZpdGVwcmVzcyc7XG5pbXBvcnQgdHlwZSB7IEhlYWRDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnO1xuXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAnbm9kZTpwYXRoJztcblxuaW1wb3J0IHtcbiAgdml0ZUFyY2hpdmVyUGx1Z2luLFxuICB2aXRlVnhlVGFibGVJbXBvcnRzUGx1Z2luLFxufSBmcm9tICdAdmJlbi92aXRlLWNvbmZpZyc7XG5cbmltcG9ydCB7XG4gIEdpdENoYW5nZWxvZyxcbiAgR2l0Q2hhbmdlbG9nTWFya2Rvd25TZWN0aW9uLFxufSBmcm9tICdAbm9sZWJhc2Uvdml0ZXByZXNzLXBsdWdpbi1naXQtY2hhbmdlbG9nL3ZpdGUnO1xuaW1wb3J0IHRhaWx3aW5kIGZyb20gJ3RhaWx3aW5kY3NzJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgcG9zdGNzc0lzb2xhdGVTdHlsZXMgfSBmcm9tICd2aXRlcHJlc3MnO1xuaW1wb3J0IHtcbiAgZ3JvdXBJY29uTWRQbHVnaW4sXG4gIGdyb3VwSWNvblZpdGVQbHVnaW4sXG59IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tZ3JvdXAtaWNvbnMnO1xuXG5pbXBvcnQgeyBkZW1vUHJldmlld1BsdWdpbiB9IGZyb20gJy4vcGx1Z2lucy9kZW1vLXByZXZpZXcnO1xuaW1wb3J0IHsgc2VhcmNoIGFzIHpoU2VhcmNoIH0gZnJvbSAnLi96aC5tdHMnO1xuXG5leHBvcnQgY29uc3Qgc2hhcmVkID0gZGVmaW5lQ29uZmlnKHtcbiAgYXBwZWFyYW5jZTogJ2RhcmsnLFxuICBoZWFkOiBoZWFkKCksXG4gIG1hcmtkb3duOiB7XG4gICAgcHJlQ29uZmlnKG1kKSB7XG4gICAgICBtZC51c2UoZGVtb1ByZXZpZXdQbHVnaW4pO1xuICAgICAgbWQudXNlKGdyb3VwSWNvbk1kUGx1Z2luKTtcbiAgICB9LFxuICB9LFxuICBwd2E6IHB3YSgpLFxuICBzcmNEaXI6ICdzcmMnLFxuICB0aGVtZUNvbmZpZzoge1xuICAgIGkxOG5Sb3V0aW5nOiB0cnVlLFxuICAgIGxvZ286ICdodHRwczovL3VucGtnLmNvbS9AdmJlbmpzL3N0YXRpYy1zb3VyY2VAMC4xLjcvc291cmNlL2xvZ28tdjEud2VicCcsXG4gICAgc2VhcmNoOiB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGxvY2FsZXM6IHtcbiAgICAgICAgICAuLi56aFNlYXJjaCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwcm92aWRlcjogJ2xvY2FsJyxcbiAgICB9LFxuICAgIHNpdGVUaXRsZTogJ1ZiZW4gQWRtaW4nLFxuICAgIHNvY2lhbExpbmtzOiBbXG4gICAgICB7IGljb246ICdnaXRodWInLCBsaW5rOiAnaHR0cHM6Ly9naXRodWIuY29tL3ZiZW5qcy92dWUtdmJlbi1hZG1pbicgfSxcbiAgICBdLFxuICB9LFxuICB0aXRsZTogJ1ZiZW4gQWRtaW4nLFxuICB2aXRlOiB7XG4gICAgYnVpbGQ6IHtcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogSW5maW5pdHksXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB0YWlsd2luZCgpLFxuICAgICAgICAgIHBvc3Rjc3NJc29sYXRlU3R5bGVzKHsgaW5jbHVkZUZpbGVzOiBbL3ZwLWRvY1xcLmNzcy9dIH0pLFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgICAgc2Nzczoge1xuICAgICAgICAgIGFwaTogJ21vZGVybicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAganNvbjoge1xuICAgICAgc3RyaW5naWZ5OiB0cnVlLFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgR2l0Q2hhbmdlbG9nKHtcbiAgICAgICAgbWFwQXV0aG9yczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG1hcEJ5TmFtZUFsaWFzZXM6IFsnVmJlbiddLFxuICAgICAgICAgICAgbmFtZTogJ3ZiZW4nLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICdhbm5jd2InLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ3ZpbmNlJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAndmluY2UyOTIwMDcnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0xpIEt1aScsXG4gICAgICAgICAgICB1c2VybmFtZTogJ2xpa3VpNjI4JyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICByZXBvVVJMOiAoKSA9PiAnaHR0cHM6Ly9naXRodWIuY29tL3ZiZW5qcy92dWUtdmJlbi1hZG1pbicsXG4gICAgICB9KSxcbiAgICAgIEdpdENoYW5nZWxvZ01hcmtkb3duU2VjdGlvbigpLFxuICAgICAgdml0ZUFyY2hpdmVyUGx1Z2luKHsgb3V0cHV0RGlyOiAnLnZpdGVwcmVzcycgfSksXG4gICAgICBncm91cEljb25WaXRlUGx1Z2luKCksXG4gICAgICBhd2FpdCB2aXRlVnhlVGFibGVJbXBvcnRzUGx1Z2luKCksXG4gICAgXSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGZzOiB7XG4gICAgICAgIGFsbG93OiBbJy4uLy4uJ10sXG4gICAgICB9LFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQ6IDYxNzMsXG4gICAgfSxcblxuICAgIHNzcjoge1xuICAgICAgZXh0ZXJuYWw6IFsnQHZ1ZS9yZXBsJ10sXG4gICAgfSxcbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiBoZWFkKCk6IEhlYWRDb25maWdbXSB7XG4gIHJldHVybiBbXG4gICAgWydtZXRhJywgeyBjb250ZW50OiAnVmJlbmpzIFRlYW0nLCBuYW1lOiAnYXV0aG9yJyB9XSxcbiAgICBbXG4gICAgICAnbWV0YScsXG4gICAgICB7XG4gICAgICAgIGNvbnRlbnQ6ICd2YmVuLCB2aXRlanMsIHZpdGUsIHNoYWNkbi11aSwgdnVlJyxcbiAgICAgICAgbmFtZTogJ2tleXdvcmRzJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbJ2xpbmsnLCB7IGhyZWY6ICcvZmF2aWNvbi5pY28nLCByZWw6ICdpY29uJywgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnIH1dLFxuICAgIFtcbiAgICAgICdtZXRhJyxcbiAgICAgIHtcbiAgICAgICAgY29udGVudDpcbiAgICAgICAgICAnd2lkdGg9ZGV2aWNlLXdpZHRoLGluaXRpYWwtc2NhbGU9MSxtaW5pbXVtLXNjYWxlPTEuMCxtYXhpbXVtLXNjYWxlPTEuMCx1c2VyLXNjYWxhYmxlPW5vJyxcbiAgICAgICAgbmFtZTogJ3ZpZXdwb3J0JyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbJ21ldGEnLCB7IGNvbnRlbnQ6ICd2YmVuIGFkbWluIGRvY3MnLCBuYW1lOiAna2V5d29yZHMnIH1dLFxuICAgIFsnbGluaycsIHsgaHJlZjogJy9mYXZpY29uLmljbycsIHJlbDogJ2ljb24nIH1dLFxuICAgIC8vIFtcbiAgICAvLyAgICdzY3JpcHQnLFxuICAgIC8vICAge1xuICAgIC8vICAgICBzcmM6ICdodHRwczovL2Nkbi50YWlsd2luZGNzcy5jb20nLFxuICAgIC8vICAgfSxcbiAgICAvLyBdLFxuICBdO1xufVxuXG5mdW5jdGlvbiBwd2EoKTogUHdhT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgaW5jbHVkZU1hbmlmZXN0SWNvbnM6IGZhbHNlLFxuICAgIG1hbmlmZXN0OiB7XG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1ZiZW4gQWRtaW4gaXMgYSBtb2Rlcm4gYWRtaW4gZGFzaGJvYXJkIHRlbXBsYXRlIGJhc2VkIG9uIFZ1ZSAzLiAnLFxuICAgICAgaWNvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgICAgICAgc3JjOiAnaHR0cHM6Ly91bnBrZy5jb20vQHZiZW5qcy9zdGF0aWMtc291cmNlQDAuMS43L3NvdXJjZS9wd2EtaWNvbi0xOTIucG5nJyxcbiAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgc3JjOiAnaHR0cHM6Ly91bnBrZy5jb20vQHZiZW5qcy9zdGF0aWMtc291cmNlQDAuMS43L3NvdXJjZS9wd2EtaWNvbi01MTIucG5nJyxcbiAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBpZDogJy8nLFxuICAgICAgbmFtZTogJ1ZiZW4gQWRtaW4gRG9jJyxcbiAgICAgIHNob3J0X25hbWU6ICd2YmVuX2FkbWluX2RvYycsXG4gICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxuICAgIH0sXG4gICAgb3V0RGlyOiByZXNvbHZlKHByb2Nlc3MuY3dkKCksICcudml0ZXByZXNzL2Rpc3QnKSxcbiAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICB3b3JrYm94OiB7XG4gICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57Y3NzLGpzLGh0bWwsc3ZnLHBuZyxpY28sdHh0LHdvZmYyfSddLFxuICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUgKiAxMDI0ICogMTAyNCxcbiAgICB9LFxuICB9O1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3BsdWdpbnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9BcHBsaWNhdGlvbnMvUGVyc29uYWwvTW9kdWxhV29ya3MvUHJvamVjdHMvN2tpLzdraV9iYWNrZW5kL3Z1ZS12YmVuLWFkbWluL2RvY3MvLnZpdGVwcmVzcy9jb25maWcvcGx1Z2lucy9kZW1vLXByZXZpZXcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0FwcGxpY2F0aW9ucy9QZXJzb25hbC9Nb2R1bGFXb3Jrcy9Qcm9qZWN0cy83a2kvN2tpX2JhY2tlbmQvdnVlLXZiZW4tYWRtaW4vZG9jcy8udml0ZXByZXNzL2NvbmZpZy9wbHVnaW5zL2RlbW8tcHJldmlldy50c1wiO2ltcG9ydCB0eXBlIHsgTWFya2Rvd25FbnYsIE1hcmtkb3duUmVuZGVyZXIgfSBmcm9tICd2aXRlcHJlc3MnO1xuXG5pbXBvcnQgY3J5cHRvIGZyb20gJ25vZGU6Y3J5cHRvJztcbmltcG9ydCB7IHJlYWRkaXJTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAnbm9kZTpwYXRoJztcblxuZXhwb3J0IGNvbnN0IHJhd1BhdGhSZWdleHAgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVnZXhwL25vLXN1cGVyLWxpbmVhci1iYWNrdHJhY2tpbmcsIHJlZ2V4cC9zdHJpY3RcbiAgL14oLis/KD86XFwuKFtcXGRhLXpdKykpPykoI1tcXHctXSspPyg/OiA/eyhcXGQrKD86WywtXVxcZCspKik/ID8oXFxTKyk/fSk/ID8oPzpcXFsoLispXSk/JC87XG5cbmZ1bmN0aW9uIHJhd1BhdGhUb1Rva2VuKHJhd1BhdGg6IHN0cmluZykge1xuICBjb25zdCBbXG4gICAgZmlsZXBhdGggPSAnJyxcbiAgICBleHRlbnNpb24gPSAnJyxcbiAgICByZWdpb24gPSAnJyxcbiAgICBsaW5lcyA9ICcnLFxuICAgIGxhbmcgPSAnJyxcbiAgICByYXdUaXRsZSA9ICcnLFxuICBdID0gKHJhd1BhdGhSZWdleHAuZXhlYyhyYXdQYXRoKSB8fCBbXSkuc2xpY2UoMSk7XG5cbiAgY29uc3QgdGl0bGUgPSByYXdUaXRsZSB8fCBmaWxlcGF0aC5zcGxpdCgnLycpLnBvcCgpIHx8ICcnO1xuXG4gIHJldHVybiB7IGV4dGVuc2lvbiwgZmlsZXBhdGgsIGxhbmcsIGxpbmVzLCByZWdpb24sIHRpdGxlIH07XG59XG5cbmV4cG9ydCBjb25zdCBkZW1vUHJldmlld1BsdWdpbiA9IChtZDogTWFya2Rvd25SZW5kZXJlcikgPT4ge1xuICBtZC5jb3JlLnJ1bGVyLmFmdGVyKCdpbmxpbmUnLCAnZGVtby1wcmV2aWV3JywgKHN0YXRlKSA9PiB7XG4gICAgY29uc3QgaW5zZXJ0Q29tcG9uZW50SW1wb3J0ID0gKGltcG9ydFN0cmluZzogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHN0YXRlLnRva2Vucy5maW5kSW5kZXgoXG4gICAgICAgIChpKSA9PiBpLnR5cGUgPT09ICdodG1sX2Jsb2NrJyAmJiBpLmNvbnRlbnQubWF0Y2goLzxzY3JpcHQgc2V0dXA+L2cpLFxuICAgICAgKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgY29uc3QgaW1wb3J0Q29tcG9uZW50ID0gbmV3IHN0YXRlLlRva2VuKCdodG1sX2Jsb2NrJywgJycsIDApO1xuICAgICAgICBpbXBvcnRDb21wb25lbnQuY29udGVudCA9IGA8c2NyaXB0IHNldHVwPlxcbiR7aW1wb3J0U3RyaW5nfVxcbjwvc2NyaXB0PlxcbmA7XG4gICAgICAgIHN0YXRlLnRva2Vucy5zcGxpY2UoMCwgMCwgaW1wb3J0Q29tcG9uZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGF0ZS50b2tlbnNbaW5kZXhdKSB7XG4gICAgICAgICAgY29uc3QgY29udGVudCA9IHN0YXRlLnRva2Vuc1tpbmRleF0uY29udGVudDtcbiAgICAgICAgICBzdGF0ZS50b2tlbnNbaW5kZXhdLmNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAgICAgICAnPC9zY3JpcHQ+JyxcbiAgICAgICAgICAgIGAke2ltcG9ydFN0cmluZ31cXG48L3NjcmlwdD5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIC8vIERlZmluZSB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIHRoZSBkZXNpcmVkIHBhdHRlcm5cbiAgICBjb25zdCByZWdleCA9IC88RGVtb1ByZXZpZXdbXj5dKlxcc2Rpcj1cIihbXlwiXSopXCIvZztcbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIE1hcmtkb3duIGNvbnRlbnQgYW5kIHJlcGxhY2UgdGhlIHBhdHRlcm5cbiAgICBzdGF0ZS5zcmMgPSBzdGF0ZS5zcmMucmVwbGFjZUFsbChyZWdleCwgKF9tYXRjaCwgZGlyKSA9PiB7XG4gICAgICBjb25zdCBjb21wb25lbnREaXIgPSBqb2luKHByb2Nlc3MuY3dkKCksICdzcmMnLCBkaXIpLnJlcGxhY2VBbGwoXG4gICAgICAgICdcXFxcJyxcbiAgICAgICAgJy8nLFxuICAgICAgKTtcblxuICAgICAgbGV0IGNoaWxkRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgICBsZXQgZGlyRXhpc3RzID0gdHJ1ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY2hpbGRGaWxlcyA9XG4gICAgICAgICAgcmVhZGRpclN5bmMoY29tcG9uZW50RGlyLCB7XG4gICAgICAgICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgICAgICAgICAgcmVjdXJzaXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHdpdGhGaWxlVHlwZXM6IGZhbHNlLFxuICAgICAgICAgIH0pIHx8IFtdO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGRpckV4aXN0cyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRpckV4aXN0cykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVuaXF1ZVdvcmQgPSBnZW5lcmF0ZUNvbnRlbnRIYXNoKGNvbXBvbmVudERpcik7XG5cbiAgICAgIGNvbnN0IENvbXBvbmVudE5hbWUgPSBgRGVtb0NvbXBvbmVudF8ke3VuaXF1ZVdvcmR9YDtcbiAgICAgIGluc2VydENvbXBvbmVudEltcG9ydChcbiAgICAgICAgYGltcG9ydCAke0NvbXBvbmVudE5hbWV9IGZyb20gJyR7Y29tcG9uZW50RGlyfS9pbmRleC52dWUnYCxcbiAgICAgICk7XG4gICAgICBjb25zdCB7IHBhdGg6IF9wYXRoIH0gPSBzdGF0ZS5lbnYgYXMgTWFya2Rvd25FbnY7XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gc3RhdGUudG9rZW5zLmZpbmRJbmRleCgoaSkgPT4gaS5jb250ZW50Lm1hdGNoKHJlZ2V4KSk7XG5cbiAgICAgIGlmICghc3RhdGUudG9rZW5zW2luZGV4XSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICBjb25zdCBmaXJzdFN0cmluZyA9ICdpbmRleC52dWUnO1xuICAgICAgY2hpbGRGaWxlcyA9IGNoaWxkRmlsZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYSA9PT0gZmlyc3RTdHJpbmcpIHJldHVybiAtMTtcbiAgICAgICAgaWYgKGIgPT09IGZpcnN0U3RyaW5nKSByZXR1cm4gMTtcbiAgICAgICAgcmV0dXJuIGEubG9jYWxlQ29tcGFyZShiLCAnZW4nLCB7IHNlbnNpdGl2aXR5OiAnYmFzZScgfSk7XG4gICAgICB9KTtcbiAgICAgIHN0YXRlLnRva2Vuc1tpbmRleF0uY29udGVudCA9XG4gICAgICAgIGA8RGVtb1ByZXZpZXcgZmlsZXM9XCIke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjaGlsZEZpbGVzKSl9XCIgPjwke0NvbXBvbmVudE5hbWV9Lz5cbiAgICAgICAgYDtcblxuICAgICAgY29uc3QgX2R1bW15VG9rZW4gPSBuZXcgc3RhdGUuVG9rZW4oJycsICcnLCAwKTtcbiAgICAgIGNvbnN0IHRva2VuQXJyYXk6IEFycmF5PHR5cGVvZiBfZHVtbXlUb2tlbj4gPSBbXTtcbiAgICAgIGNoaWxkRmlsZXMuZm9yRWFjaCgoZmlsZW5hbWUpID0+IHtcbiAgICAgICAgLy8gY29uc3Qgc2xvdE5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKGV4dG5hbWUoZmlsZW5hbWUpLCAnJyk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVTdGFydCA9IG5ldyBzdGF0ZS5Ub2tlbignaHRtbF9pbmxpbmUnLCAnJywgMCk7XG4gICAgICAgIHRlbXBsYXRlU3RhcnQuY29udGVudCA9IGA8dGVtcGxhdGUgIyR7ZmlsZW5hbWV9PmA7XG4gICAgICAgIHRva2VuQXJyYXkucHVzaCh0ZW1wbGF0ZVN0YXJ0KTtcblxuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSBqb2luKGNvbXBvbmVudERpciwgZmlsZW5hbWUpO1xuXG4gICAgICAgIGNvbnN0IHsgZXh0ZW5zaW9uLCBmaWxlcGF0aCwgbGFuZywgbGluZXMsIHRpdGxlIH0gPVxuICAgICAgICAgIHJhd1BhdGhUb1Rva2VuKHJlc29sdmVkUGF0aCk7XG4gICAgICAgIC8vIEFkZCBjb2RlIHRva2VucyBmb3IgZWFjaCBsaW5lXG4gICAgICAgIGNvbnN0IHRva2VuID0gbmV3IHN0YXRlLlRva2VuKCdmZW5jZScsICdjb2RlJywgMCk7XG4gICAgICAgIHRva2VuLmluZm8gPSBgJHtsYW5nIHx8IGV4dGVuc2lvbn0ke2xpbmVzID8gYHske2xpbmVzfX1gIDogJyd9JHtcbiAgICAgICAgICB0aXRsZSA/IGBbJHt0aXRsZX1dYCA6ICcnXG4gICAgICAgIH1gO1xuXG4gICAgICAgIHRva2VuLmNvbnRlbnQgPSBgPDw8ICR7ZmlsZXBhdGh9YDtcbiAgICAgICAgKHRva2VuIGFzIGFueSkuc3JjID0gW3Jlc29sdmVkUGF0aF07XG4gICAgICAgIHRva2VuQXJyYXkucHVzaCh0b2tlbik7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVFbmQgPSBuZXcgc3RhdGUuVG9rZW4oJ2h0bWxfaW5saW5lJywgJycsIDApO1xuICAgICAgICB0ZW1wbGF0ZUVuZC5jb250ZW50ID0gJzwvdGVtcGxhdGU+JztcbiAgICAgICAgdG9rZW5BcnJheS5wdXNoKHRlbXBsYXRlRW5kKTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZW5kVGFnID0gbmV3IHN0YXRlLlRva2VuKCdodG1sX2lubGluZScsICcnLCAwKTtcbiAgICAgIGVuZFRhZy5jb250ZW50ID0gJzwvRGVtb1ByZXZpZXc+JztcbiAgICAgIHRva2VuQXJyYXkucHVzaChlbmRUYWcpO1xuXG4gICAgICBzdGF0ZS50b2tlbnMuc3BsaWNlKGluZGV4ICsgMSwgMCwgLi4udG9rZW5BcnJheSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKFxuICAgICAgLy8gICBzdGF0ZS5tZC5yZW5kZXJlci5yZW5kZXIoc3RhdGUudG9rZW5zLCBzdGF0ZT8ub3B0aW9ucyA/PyBbXSwgc3RhdGUuZW52KSxcbiAgICAgIC8vICk7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVDb250ZW50SGFzaChpbnB1dDogc3RyaW5nLCBsZW5ndGg6IG51bWJlciA9IDEwKTogc3RyaW5nIHtcbiAgLy8gXHU0RjdGXHU3NTI4IFNIQS0yNTYgXHU3NTFGXHU2MjEwXHU1NEM4XHU1RTBDXHU1MDNDXG4gIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGlucHV0KS5kaWdlc3QoJ2hleCcpO1xuXG4gIC8vIFx1NUMwNlx1NTRDOFx1NUUwQ1x1NTAzQ1x1OEY2Q1x1NjM2Mlx1NEUzQSBCYXNlMzYgXHU3RjE2XHU3ODAxXHVGRjBDXHU1RTc2XHU1M0Q2XHU2MzA3XHU1QjlBXHU5NTdGXHU1RUE2XHU3Njg0XHU1QjU3XHU3QjI2XHU0RjVDXHU0RTNBXHU3RUQzXHU2NzlDXG4gIHJldHVybiBOdW1iZXIucGFyc2VJbnQoaGFzaCwgMTYpLnRvU3RyaW5nKDM2KS5zbGljZSgwLCBsZW5ndGgpO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3poLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQXBwbGljYXRpb25zL1BlcnNvbmFsL01vZHVsYVdvcmtzL1Byb2plY3RzLzdraS83a2lfYmFja2VuZC92dWUtdmJlbi1hZG1pbi9kb2NzLy52aXRlcHJlc3MvY29uZmlnL3poLm10c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uLy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBjb25zdCB6aCA9IGRlZmluZUNvbmZpZyh7XG4gIGRlc2NyaXB0aW9uOiAnVmJlbiBBZG1pbiAmIFx1NEYwMVx1NEUxQVx1N0VBN1x1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlx1Njg0Nlx1NjdCNicsXG4gIGxhbmc6ICd6aC1IYW5zJyxcbiAgdGhlbWVDb25maWc6IHtcbiAgICBkYXJrTW9kZVN3aXRjaExhYmVsOiAnXHU0RTNCXHU5ODk4JyxcbiAgICBkYXJrTW9kZVN3aXRjaFRpdGxlOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU2REYxXHU4MjcyXHU2QTIxXHU1RjBGJyxcbiAgICBkb2NGb290ZXI6IHtcbiAgICAgIG5leHQ6ICdcdTRFMEJcdTRFMDBcdTk4NzUnLFxuICAgICAgcHJldjogJ1x1NEUwQVx1NEUwMFx1OTg3NScsXG4gICAgfSxcbiAgICBlZGl0TGluazoge1xuICAgICAgcGF0dGVybjpcbiAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW4vZWRpdC9tYWluL2RvY3Mvc3JjLzpwYXRoJyxcbiAgICAgIHRleHQ6ICdcdTU3MjggR2l0SHViIFx1NEUwQVx1N0YxNlx1OEY5MVx1NkI2NFx1OTg3NVx1OTc2MicsXG4gICAgfSxcbiAgICBmb290ZXI6IHtcbiAgICAgIGNvcHlyaWdodDogYENvcHlyaWdodCBcdTAwQTkgMjAyMC0ke25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gVmJlbmAsXG4gICAgICBtZXNzYWdlOiAnXHU1N0ZBXHU0RThFIE1JVCBcdThCQjhcdTUzRUZcdTUzRDFcdTVFMDMuJyxcbiAgICB9LFxuICAgIGxhbmdNZW51TGFiZWw6ICdcdTU5MUFcdThCRURcdThBMDAnLFxuICAgIGxhc3RVcGRhdGVkOiB7XG4gICAgICBmb3JtYXRPcHRpb25zOiB7XG4gICAgICAgIGRhdGVTdHlsZTogJ3Nob3J0JyxcbiAgICAgICAgdGltZVN0eWxlOiAnbWVkaXVtJyxcbiAgICAgIH0sXG4gICAgICB0ZXh0OiAnXHU2NzAwXHU1NDBFXHU2NkY0XHU2NUIwXHU0RThFJyxcbiAgICB9LFxuICAgIGxpZ2h0TW9kZVN3aXRjaFRpdGxlOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU2RDQ1XHU4MjcyXHU2QTIxXHU1RjBGJyxcbiAgICBuYXY6IG5hdigpLFxuXG4gICAgb3V0bGluZToge1xuICAgICAgbGFiZWw6ICdcdTk4NzVcdTk3NjJcdTVCRkNcdTgyMkEnLFxuICAgIH0sXG4gICAgcmV0dXJuVG9Ub3BMYWJlbDogJ1x1NTZERVx1NTIzMFx1OTg3Nlx1OTBFOCcsXG5cbiAgICBzaWRlYmFyOiB7XG4gICAgICAnL2NvbW1lcmNpYWwvJzogeyBiYXNlOiAnL2NvbW1lcmNpYWwvJywgaXRlbXM6IHNpZGViYXJDb21tZXJjaWFsKCkgfSxcbiAgICAgICcvY29tcG9uZW50cy8nOiB7IGJhc2U6ICcvY29tcG9uZW50cy8nLCBpdGVtczogc2lkZWJhckNvbXBvbmVudHMoKSB9LFxuICAgICAgJy9ndWlkZS8nOiB7IGJhc2U6ICcvZ3VpZGUvJywgaXRlbXM6IHNpZGViYXJHdWlkZSgpIH0sXG4gICAgfSxcbiAgICBzaWRlYmFyTWVudUxhYmVsOiAnXHU4M0RDXHU1MzU1JyxcbiAgfSxcbn0pO1xuXG5mdW5jdGlvbiBzaWRlYmFyR3VpZGUoKTogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICB0ZXh0OiAnXHU3QjgwXHU0RUNCJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnaW50cm9kdWN0aW9uL3ZiZW4nLFxuICAgICAgICAgIHRleHQ6ICdcdTUxNzNcdTRFOEUgVmJlbiBBZG1pbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnaW50cm9kdWN0aW9uL3doeScsXG4gICAgICAgICAgdGV4dDogJ1x1NEUzQVx1NEVDMFx1NEU0OFx1OTAwOVx1NjJFOVx1NjIxMVx1NEVFQz8nLFxuICAgICAgICB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vcXVpY2stc3RhcnQnLCB0ZXh0OiAnXHU1RkVCXHU5MDFGXHU1RjAwXHU1OUNCJyB9LFxuICAgICAgICB7IGxpbms6ICdpbnRyb2R1Y3Rpb24vdGhpbicsIHRleHQ6ICdcdTdDQkVcdTdCODBcdTcyNDhcdTY3MkMnIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiYXNlOiAnLycsXG4gICAgICAgICAgbGluazogJ2NvbXBvbmVudHMvaW50cm9kdWN0aW9uJyxcbiAgICAgICAgICB0ZXh0OiAnXHU3RUM0XHU0RUY2XHU2NTg3XHU2ODYzJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnXHU1N0ZBXHU3ODQwJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvY29uY2VwdCcsIHRleHQ6ICdcdTU3RkFcdTc4NDBcdTY5ODJcdTVGRjUnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZGV2ZWxvcG1lbnQnLCB0ZXh0OiAnXHU2NzJDXHU1NzMwXHU1RjAwXHU1M0QxJyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3JvdXRlJywgdGV4dDogJ1x1OERFRlx1NzUzMVx1NTQ4Q1x1ODNEQ1x1NTM1NScgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9zZXR0aW5ncycsIHRleHQ6ICdcdTkxNERcdTdGNkUnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvaWNvbnMnLCB0ZXh0OiAnXHU1NkZFXHU2ODA3JyB9LFxuICAgICAgICB7IGxpbms6ICdlc3NlbnRpYWxzL3N0eWxlcycsIHRleHQ6ICdcdTY4MzdcdTVGMEYnIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvZXh0ZXJuYWwtbW9kdWxlJywgdGV4dDogJ1x1NTkxNlx1OTBFOFx1NkEyMVx1NTc1NycgfSxcbiAgICAgICAgeyBsaW5rOiAnZXNzZW50aWFscy9idWlsZCcsIHRleHQ6ICdcdTY3ODRcdTVFRkFcdTRFMEVcdTkwRThcdTdGNzInIH0sXG4gICAgICAgIHsgbGluazogJ2Vzc2VudGlhbHMvc2VydmVyJywgdGV4dDogJ1x1NjcwRFx1NTJBMVx1N0FFRlx1NEVBNFx1NEU5Mlx1NEUwRVx1NjU3MFx1NjM2RU1vY2snIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ1x1NkRGMVx1NTE2NScsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9sb2dpbicsIHRleHQ6ICdcdTc2N0JcdTVGNTUnIH0sXG4gICAgICAgIC8vIHsgbGluazogJ2luLWRlcHRoL2xheW91dCcsIHRleHQ6ICdcdTVFMDNcdTVDNDAnIH0sXG4gICAgICAgIHsgbGluazogJ2luLWRlcHRoL3RoZW1lJywgdGV4dDogJ1x1NEUzQlx1OTg5OCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvYWNjZXNzJywgdGV4dDogJ1x1Njc0M1x1OTY1MCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9jYWxlJywgdGV4dDogJ1x1NTZGRFx1OTY0NVx1NTMxNicgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvZmVhdHVyZXMnLCB0ZXh0OiAnXHU1RTM4XHU3NTI4XHU1MjlGXHU4MEZEJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC9jaGVjay11cGRhdGVzJywgdGV4dDogJ1x1NjhDMFx1NjdFNVx1NjZGNFx1NjVCMCcgfSxcbiAgICAgICAgeyBsaW5rOiAnaW4tZGVwdGgvbG9hZGluZycsIHRleHQ6ICdcdTUxNjhcdTVDNDBsb2FkaW5nJyB9LFxuICAgICAgICB7IGxpbms6ICdpbi1kZXB0aC91aS1mcmFtZXdvcmsnLCB0ZXh0OiAnXHU3RUM0XHU0RUY2XHU1RTkzXHU1MjA3XHU2MzYyJyB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6ICdcdTVERTVcdTdBMEInLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9zdGFuZGFyZCcsIHRleHQ6ICdcdTg5QzRcdTgzMDMnIH0sXG4gICAgICAgIHsgbGluazogJ3Byb2plY3QvY2xpJywgdGV4dDogJ0NMSScgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9kaXInLCB0ZXh0OiAnXHU3NkVFXHU1RjU1XHU4QkY0XHU2NjBFJyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3Rlc3QnLCB0ZXh0OiAnXHU1MzU1XHU1MTQzXHU2RDRCXHU4QkQ1JyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3RhaWx3aW5kY3NzJywgdGV4dDogJ1RhaWx3aW5kIENTUycgfSxcbiAgICAgICAgeyBsaW5rOiAncHJvamVjdC9jaGFuZ2VzZXQnLCB0ZXh0OiAnQ2hhbmdlc2V0JyB9LFxuICAgICAgICB7IGxpbms6ICdwcm9qZWN0L3ZpdGUnLCB0ZXh0OiAnVml0ZSBDb25maWcnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgdGV4dDogJ1x1NTE3Nlx1NEVENicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7IGxpbms6ICdvdGhlci9wcm9qZWN0LXVwZGF0ZScsIHRleHQ6ICdcdTk4NzlcdTc2RUVcdTY2RjRcdTY1QjAnIH0sXG4gICAgICAgIHsgbGluazogJ290aGVyL3JlbW92ZS1jb2RlJywgdGV4dDogJ1x1NzlGQlx1OTY2NFx1NEVFM1x1NzgwMScgfSxcbiAgICAgICAgeyBsaW5rOiAnb3RoZXIvZmFxJywgdGV4dDogJ1x1NUUzOFx1ODlDMVx1OTVFRVx1OTg5OCcgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgXTtcbn1cblxuZnVuY3Rpb24gc2lkZWJhckNvbW1lcmNpYWwoKTogRGVmYXVsdFRoZW1lLlNpZGViYXJJdGVtW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGxpbms6ICdjb21tdW5pdHknLFxuICAgICAgdGV4dDogJ1x1NEVBNFx1NkQ0MVx1N0ZBNCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAndGVjaG5pY2FsLXN1cHBvcnQnLFxuICAgICAgdGV4dDogJ1x1NjI4MFx1NjcyRlx1NjUyRlx1NjMwMScsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnY3VzdG9taXplZCcsXG4gICAgICB0ZXh0OiAnXHU1QjlBXHU1MjM2XHU1RjAwXHU1M0QxJyxcbiAgICB9LFxuICBdO1xufVxuXG5mdW5jdGlvbiBzaWRlYmFyQ29tcG9uZW50cygpOiBEZWZhdWx0VGhlbWUuU2lkZWJhckl0ZW1bXSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgdGV4dDogJ1x1N0VDNFx1NEVGNicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2ludHJvZHVjdGlvbicsXG4gICAgICAgICAgdGV4dDogJ1x1NEVDQlx1N0VDRCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIHRleHQ6ICdcdTVFMDNcdTVDNDBcdTdFQzRcdTRFRjYnLFxuICAgICAgaXRlbXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdsYXlvdXQtdWkvcGFnZScsXG4gICAgICAgICAgdGV4dDogJ1BhZ2UgXHU5ODc1XHU5NzYyJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgdGV4dDogJ1x1OTAxQVx1NzUyOFx1N0VDNFx1NEVGNicsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWFwaS1jb21wb25lbnQnLFxuICAgICAgICAgIHRleHQ6ICdBcGlDb21wb25lbnQgQXBpXHU3RUM0XHU0RUY2XHU1MzA1XHU4OEM1XHU1NjY4JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdjb21tb24tdWkvdmJlbi1hbGVydCcsXG4gICAgICAgICAgdGV4dDogJ0FsZXJ0IFx1OEY3Qlx1OTFDRlx1NjNEMFx1NzkzQVx1Njg0NicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tbW9kYWwnLFxuICAgICAgICAgIHRleHQ6ICdNb2RhbCBcdTZBMjFcdTYwMDFcdTY4NDYnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWRyYXdlcicsXG4gICAgICAgICAgdGV4dDogJ0RyYXdlciBcdTYyQkRcdTVDNDknLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2NvbW1vbi11aS92YmVuLWZvcm0nLFxuICAgICAgICAgIHRleHQ6ICdGb3JtIFx1ODg2OFx1NTM1NScsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tdnhlLXRhYmxlJyxcbiAgICAgICAgICB0ZXh0OiAnVnhlIFRhYmxlIFx1ODg2OFx1NjgzQycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsaW5rOiAnY29tbW9uLXVpL3ZiZW4tY291bnQtdG8tYW5pbWF0b3InLFxuICAgICAgICAgIHRleHQ6ICdDb3VudFRvQW5pbWF0b3IgXHU2NTcwXHU1QjU3XHU1MkE4XHU3NTNCJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdjb21tb24tdWkvdmJlbi1lbGxpcHNpcy10ZXh0JyxcbiAgICAgICAgICB0ZXh0OiAnRWxsaXBzaXNUZXh0IFx1NzcwMVx1NzU2NVx1NjU4N1x1NjcyQycsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIG5hdigpOiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBhY3RpdmVNYXRjaDogJ14vKGd1aWRlfGNvbXBvbmVudHMpLycsXG4gICAgICB0ZXh0OiAnXHU2NTg3XHU2ODYzJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpdmVNYXRjaDogJ14vZ3VpZGUvJyxcbiAgICAgICAgICBsaW5rOiAnL2d1aWRlL2ludHJvZHVjdGlvbi92YmVuJyxcbiAgICAgICAgICB0ZXh0OiAnXHU2MzA3XHU1MzU3JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGl2ZU1hdGNoOiAnXi9jb21wb25lbnRzLycsXG4gICAgICAgICAgbGluazogJy9jb21wb25lbnRzL2ludHJvZHVjdGlvbicsXG4gICAgICAgICAgdGV4dDogJ1x1N0VDNFx1NEVGNicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHU1Mzg2XHU1M0YyXHU3MjQ4XHU2NzJDJyxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9kb2MudnZiaW4uY24nLFxuICAgICAgICAgICAgICB0ZXh0OiAnMi54XHU3MjQ4XHU2NzJDXHU2NTg3XHU2ODYzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0ZXh0OiAnXHU2RjE0XHU3OTNBJyxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnVmJlbiBBZG1pbicsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vd3d3LnZiZW4ucHJvJyxcbiAgICAgICAgICAgICAgdGV4dDogJ1x1NkYxNFx1NzkzQVx1NzI0OFx1NjcyQycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9hbnQudmJlbi5wcm8nLFxuICAgICAgICAgICAgICB0ZXh0OiAnQW50IERlc2lnbiBWdWUgXHU3MjQ4XHU2NzJDJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxpbms6ICdodHRwczovL25haXZlLnZiZW4ucHJvJyxcbiAgICAgICAgICAgICAgdGV4dDogJ05haXZlIFx1NzI0OFx1NjcyQycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9lbGUudmJlbi5wcm8nLFxuICAgICAgICAgICAgICB0ZXh0OiAnRWxlbWVudCBQbHVzXHU3MjQ4XHU2NzJDJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdTUxNzZcdTRFRDYnLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGxpbms6ICdodHRwczovL3ZiZW4udnZiaW4uY24nLFxuICAgICAgICAgICAgICB0ZXh0OiAnVmJlbiBBZG1pbiAyLngnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHQ6IHZlcnNpb24sXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS92YmVuanMvdnVlLXZiZW4tYWRtaW4vcmVsZWFzZXMnLFxuICAgICAgICAgIHRleHQ6ICdcdTY2RjRcdTY1QjBcdTY1RTVcdTVGRDcnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9vcmdzL3ZiZW5qcy9wcm9qZWN0cy81JyxcbiAgICAgICAgICB0ZXh0OiAnXHU4REVGXHU3RUJGXHU1NkZFJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vdmJlbmpzL3Z1ZS12YmVuLWFkbWluL2Jsb2IvbWFpbi8uZ2l0aHViL2NvbnRyaWJ1dGluZy5tZCcsXG4gICAgICAgICAgdGV4dDogJ1x1OEQyMVx1NzMyRScsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgbGluazogJy9jb21tZXJjaWFsL3RlY2huaWNhbC1zdXBwb3J0JyxcbiAgICAgIHRleHQ6ICdcdUQ4M0VcdUREODQgXHU2MjgwXHU2NzJGXHU2NTJGXHU2MzAxJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxpbms6ICcvc3BvbnNvci9wZXJzb25hbCcsXG4gICAgICB0ZXh0OiAnXHUyNzI4IFx1OEQ1RVx1NTJBOScsXG4gICAgfSxcbiAgICB7XG4gICAgICBsaW5rOiAnL2NvbW1lcmNpYWwvY29tbXVuaXR5JyxcbiAgICAgIHRleHQ6ICdcdUQ4M0RcdURDNjhcdTIwMERcdUQ4M0RcdURDNjZcdTIwMERcdUQ4M0RcdURDNjYgXHU0RUE0XHU2RDQxXHU3RkE0JyxcbiAgICAgIC8vIGl0ZW1zOiBbXG4gICAgICAvLyAgIHtcbiAgICAgIC8vICAgICBsaW5rOiAnaHR0cHM6Ly9xdW4ucXEuY29tL3Fxd2ViL3F1bnByby9zaGFyZT9fd3Y9MyZfd3d2PTEyOCZhcHBDaGFubmVsPXNoYXJlJmludml0ZUNvZGU9MjJ5U3pqN3BLaXcmYnVzaW5lc3NUeXBlPTkmZnJvbT0yNDY2MTAmYml6PWthJm1haW5Tb3VyY2VJZD1zaGFyZSZzdWJTb3VyY2VJZD1vdGhlcnMmanVtcHNvdXJjZT1zaG9ydHVybCMvcGMnLFxuICAgICAgLy8gICAgIHRleHQ6ICdRUVx1OTg5MVx1OTA1MycsXG4gICAgICAvLyAgIH0sXG4gICAgICAvLyAgIHtcbiAgICAgIC8vICAgICBsaW5rOiAnaHR0cHM6Ly9xbS5xcS5jb20vY2dpLWJpbi9xbS9xcj9fd3Y9MTAyNyZrPW1qWm1saGdWenpVeHZkeGxsQjZDMXZIcFg4TzhRUkwwJmF1dGhLZXk9REJkRmJCd0VSbWZhS1k5NUp2UldxTENKSVJHSkFtS3laYnJwelo0MUVLRE1aNVNSNk1mYmpPQmFhTlJONzNmciZub3ZlcmlmeT0wJmdyb3VwX2NvZGU9NDI4NjEwOScsXG4gICAgICAvLyAgICAgdGV4dDogJ1FRXHU3RkE0JyxcbiAgICAgIC8vICAgfSxcbiAgICAgIC8vICAge1xuICAgICAgLy8gICAgIGxpbms6ICdodHRwczovL2Rpc2NvcmQuZ2cvVlU2MmpUZWNhZCcsXG4gICAgICAvLyAgICAgdGV4dDogJ0Rpc2NvcmQnLFxuICAgICAgLy8gICB9LFxuICAgICAgLy8gXSxcbiAgICB9LFxuICAgIC8vIHtcbiAgICAvLyAgIGxpbms6ICcvZnJpZW5kLWxpbmtzLycsXG4gICAgLy8gICB0ZXh0OiAnXHVEODNFXHVERDFEIFx1NTNDQlx1NjBDNVx1OTRGRVx1NjNBNScsXG4gICAgLy8gfSxcbiAgXTtcbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaDogRGVmYXVsdFRoZW1lLkFsZ29saWFTZWFyY2hPcHRpb25zWydsb2NhbGVzJ10gPSB7XG4gIHJvb3Q6IHtcbiAgICBwbGFjZWhvbGRlcjogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgdHJhbnNsYXRpb25zOiB7XG4gICAgICBidXR0b246IHtcbiAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiAnXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzJyxcbiAgICAgICAgYnV0dG9uVGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXG4gICAgICB9LFxuICAgICAgbW9kYWw6IHtcbiAgICAgICAgZXJyb3JTY3JlZW46IHtcbiAgICAgICAgICBoZWxwVGV4dDogJ1x1NEY2MFx1NTNFRlx1ODBGRFx1OTcwMFx1ODk4MVx1NjhDMFx1NjdFNVx1NEY2MFx1NzY4NFx1N0Y1MVx1N0VEQ1x1OEZERVx1NjNBNScsXG4gICAgICAgICAgdGl0bGVUZXh0OiAnXHU2NUUwXHU2Q0Q1XHU4M0I3XHU1M0Q2XHU3RUQzXHU2NzlDJyxcbiAgICAgICAgfSxcbiAgICAgICAgZm9vdGVyOiB7XG4gICAgICAgICAgY2xvc2VUZXh0OiAnXHU1MTczXHU5NUVEJyxcbiAgICAgICAgICBuYXZpZ2F0ZVRleHQ6ICdcdTUyMDdcdTYzNjInLFxuICAgICAgICAgIHNlYXJjaEJ5VGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjNEMFx1NEY5Qlx1ODAwNScsXG4gICAgICAgICAgc2VsZWN0VGV4dDogJ1x1OTAwOVx1NjJFOScsXG4gICAgICAgIH0sXG4gICAgICAgIG5vUmVzdWx0c1NjcmVlbjoge1xuICAgICAgICAgIG5vUmVzdWx0c1RleHQ6ICdcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUMnLFxuICAgICAgICAgIHJlcG9ydE1pc3NpbmdSZXN1bHRzTGlua1RleHQ6ICdcdTcwQjlcdTUxRkJcdTUzQ0RcdTk5ODgnLFxuICAgICAgICAgIHJlcG9ydE1pc3NpbmdSZXN1bHRzVGV4dDogJ1x1NEY2MFx1OEJBNFx1NEUzQVx1OEJFNVx1NjdFNVx1OEJFMlx1NUU5NFx1OEJFNVx1NjcwOVx1N0VEM1x1Njc5Q1x1RkYxRicsXG4gICAgICAgICAgc3VnZ2VzdGVkUXVlcnlUZXh0OiAnXHU0RjYwXHU1M0VGXHU0RUU1XHU1QzFEXHU4QkQ1XHU2N0U1XHU4QkUyJyxcbiAgICAgICAgfSxcbiAgICAgICAgc2VhcmNoQm94OiB7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uQXJpYUxhYmVsOiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnXHU1M0Q2XHU2RDg4JyxcbiAgICAgICAgICByZXNldEJ1dHRvbkFyaWFMYWJlbDogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXJ0U2NyZWVuOiB7XG4gICAgICAgICAgZmF2b3JpdGVTZWFyY2hlc1RpdGxlOiAnXHU2NTM2XHU4NUNGJyxcbiAgICAgICAgICBub1JlY2VudFNlYXJjaGVzVGV4dDogJ1x1NkNBMVx1NjcwOVx1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgICAgcmVjZW50U2VhcmNoZXNUaXRsZTogJ1x1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgICAgcmVtb3ZlRmF2b3JpdGVTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEVDRVx1NjUzNlx1ODVDRlx1NEUyRFx1NzlGQlx1OTY2NCcsXG4gICAgICAgICAgcmVtb3ZlUmVjZW50U2VhcmNoQnV0dG9uVGl0bGU6ICdcdTRFQ0VcdTY0MUNcdTdEMjJcdTUzODZcdTUzRjJcdTRFMkRcdTc5RkJcdTk2NjQnLFxuICAgICAgICAgIHNhdmVSZWNlbnRTZWFyY2hCdXR0b25UaXRsZTogJ1x1NEZERFx1NUI1OFx1ODFGM1x1NjQxQ1x1N0QyMlx1NTM4Nlx1NTNGMicsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyYyxTQUFTLGVBQWU7QUFDbmUsU0FBUyw2QkFBNkI7OztBQ0N0QyxTQUFTLG9CQUFvQjs7O0FDQTNCLGNBQVc7OztBRElOLElBQU0sS0FBSyxhQUFhO0FBQUEsRUFDN0IsYUFBYTtBQUFBLEVBQ2IsTUFBTTtBQUFBLEVBQ04sYUFBYTtBQUFBLElBQ1gscUJBQXFCO0FBQUEsSUFDckIscUJBQXFCO0FBQUEsSUFDckIsV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLElBQ1I7QUFBQSxJQUNBLFVBQVU7QUFBQSxNQUNSLFNBQ0U7QUFBQSxNQUNGLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixXQUFXLHdCQUFvQixvQkFBSSxLQUFLLEdBQUUsWUFBWSxDQUFDO0FBQUEsTUFDdkQsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLGVBQWU7QUFBQSxJQUNmLGFBQWE7QUFBQSxNQUNYLGVBQWU7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLFdBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSxNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0Esc0JBQXNCO0FBQUEsSUFD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QUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLFNBQVNELE9BQThCO0FBQ3JDLFNBQU87QUFBQSxJQUNMO0FBQUEsTUFDRSxhQUFhO0FBQUEsTUFDYixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsTUFBTTtBQUFBLFVBQ04sTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxhQUFhO0FBQUEsVUFDYixNQUFNO0FBQUEsVUFDTixNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE9BQU87QUFBQSxZQUNMO0FBQUEsY0FDRSxNQUFNO0FBQUEsY0FDTixNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTTtBQUFBLFVBQ04sT0FBTztBQUFBLFlBQ0w7QUFBQSxjQUNFLE1BQU07QUFBQSxjQUNOLE1BQU07QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLGNBQ0UsTUFBTTtBQUFBLGNBQ04sTUFBTTtBQUFBLFlBQ1I7QUFB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LElBQ0wsQ0FBQyxRQUFRLEVBQUUsU0FBUyxlQUFlLE1BQU0sU0FBUyxDQUFDO0FBQUEsSUFDbkQ7QUFBQSxNQUNFO0FBQUEsTUFDQTtBQUFBLFFBQ0UsU0FBUztBQUFBLFFBQ1QsTUFBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsSUFDQSxDQUFDLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixLQUFLLFFBQVEsTUFBTSxnQkFBZ0IsQ0FBQztBQUFBLElBQ3JFO0FBQUEsTUFDRTtBQUFBLE1BQ0E7QUFBQSxRQUNFLFNBQ0U7QUFBQSxRQUNGLE1BQU07QUFBQSxNQUNSO0FBQUEsSUFDRjtBQUFBLElBQ0EsQ0FBQyxRQUFRLEVBQUUsU0FBUyxtQkFBbUIsTUFBTSxXQUFXLENBQUM7QUFBQSxJQUN6RCxDQUFDLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixLQUFLLE9BQU8sQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBT2hEO0FBQ0Y7QUFFQSxTQUFTLE1BQWtCO0FBQ3pCLFNBQU87QUFBQSxJQUNMLHNCQUFzQjtBQUFBLElBQ3RCLFVBQVU7QUFBQSxNQUNSLGFBQ0U7QUFBQSxNQUNGLE9BQU87QUFBQSxRQUNMO0FBQUEsVUFDRSxPQUFPO0FBQUEsVUFDUCxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE9BQU87QUFBQSxVQUNQLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLE1BQ0EsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osYUFBYTtBQUFBLElBQ2Y7QUFBQSxJQUNBLFFBQVEsUUFBUSxRQUFRLElBQUksR0FBRyxpQkFBaUI7QUFBQSxJQUNoRCxjQUFjO0FBQUEsSUFDZCxTQUFTO0FBQUEsTUFDUCxjQUFjLENBQUMsMENBQTBDO0FBQUEsTUFDekQsK0JBQStCLElBQUksT0FBTztBQUFBLElBQzVDO0FBQUEsRUFDRjtBQUNGOzs7QUhwS0EsSUFBTyxnQkFBUTtBQUFBLEVBQ2Isc0JBQXNCO0FBQUEsSUFDcEIsR0FBRztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsSUFBSTtBQUFBLFFBQ0YsT0FBTztBQUFBLFFBQ1AsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLFFBQ04sR0FBRztBQUFBLE1BQ0w7QUFBQSxNQUNBLE1BQU07QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIiwgImRlZmluZUNvbmZpZyIsICJuYXYiLCAic2lkZWJhckNvbW1lcmNpYWwiLCAic2lkZWJhckd1aWRlIiwgImRlZmluZUNvbmZpZyJdCn0K
