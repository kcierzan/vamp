const esbuild = require("esbuild");
const sveltePlugin = require("esbuild-svelte");
const importGlobPlugin = require("esbuild-plugin-import-glob").default;
const sveltePreprocess = require("svelte-preprocess");

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const deploy = args.includes("--deploy");

let optsClient = {
  entryPoints: ["js/app.js"],
  bundle: true,
  minify: deploy,
  target: "es2017",
  conditions: ["svelte", "browser"],
  mainFields: ["module", "browser", "main"],
  outdir: "../priv/static/assets",
  logLevel: "info",
  sourcemap: watch ? "inline" : false,
  watch,
  tsconfig: "./tsconfig.json",
  plugins: [
    importGlobPlugin(),
    sveltePlugin({
      // cache: "overzealous",
      preprocess: sveltePreprocess({ postcss: true }),
      compilerOptions: { dev: !deploy, hydratable: true, css: "injected" },
    }),
  ],
};

let optsWorker = {
  entryPoints: ["js/sampler/phase-vocoder.ts"],
  bundle: true,
  minify: deploy,
  target: "es2017",
  conditions: ["browser"],
  mainFields: ["module", "browser", "main"],
  outdir: "../priv/static/assets",
  logLevel: "info",
  sourcemap: watch ? "inline" : false,
  watch,
  tsconfig: "./tsconfig.json",
}

let optsServer = {
  entryPoints: ["js/server.js"],
  platform: "node",
  bundle: true,
  minify: false,
  target: "node19.6.1",
  conditions: ["svelte"],
  outdir: "../priv/svelte",
  logLevel: "info",
  sourcemap: watch ? "inline" : false,
  watch,
  tsconfig: "./tsconfig.json",
  plugins: [
    importGlobPlugin(),
    sveltePlugin({
      // cache: "overzealous",
      preprocess: sveltePreprocess({ postcss: true }),
      compilerOptions: { dev: !deploy, hydratable: true, generate: "ssr" },
    }),
  ],
};

const client = esbuild.build(optsClient);
const server = esbuild.build(optsServer);
const worker = esbuild.build(optsWorker);

if (watch) {
  client.then((_result) => {
    process.stdin.on("close", () => process.exit(0));
    process.stdin.resume();
  });

  server.then((_result) => {
    process.stdin.on("close", () => process.exit(0));
    process.stdin.resume();
  });

  worker.then((_result) => {
    process.stdin.on("close", () => process.exit(0));
    process.stdin.resume();
  });
}
