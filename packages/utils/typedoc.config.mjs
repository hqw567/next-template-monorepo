/** @type {Partial<import("typedoc").TypeDocOptions> & import('typedoc-plugin-markdown').PluginOptions} */
const config = {
  plugin: ["typedoc-plugin-markdown", "typedoc-vitepress-theme"],
  entryPoints: ["src/index.ts"],
  entryPointStrategy: "expand",
  out: "docs/reference",
  gitRevision: "main",
  githubPages: false,
  hideGenerator: true,
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true,
  sort: ["source-order"],
  flattenOutputFiles: true,
  categoryOrder: ["*"],
  disableSources: true,
  preserveWatchOutput: true,
  skipErrorChecking: true,
  readme: "none",
  kindSortOrder: ["Function", "Variable"],
  excludeReferences: true,
  excludeNotDocumented: true,
  hideBreadcrumbs: true,
  hidePageTitle: false,
}

export default config
