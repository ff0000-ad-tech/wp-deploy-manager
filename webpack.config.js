const _ = require("lodash");
const path = require("path");

const debug = require("@ff0000-ad-tech/debug");
var log = debug("DM:webpack.config.js");

const PM = require("@ff0000-ad-tech/wp-process-manager");
const DM = require("@ff0000-ad-tech/wp-deploy-manager");
const IndexVariationResolvePlugin = require("@ff0000-ad-tech/wp-resolve-plugin-index-variation");

const execute = (config, scope) => {
  if (config) {
    config = JSON.parse(config);
  } else {
    config = {};
  }

  /** -- PROCESS MANAGEMENT -----------------------------------------------------------------------------------------------
   *
   * 	keep this script in sync with Creative Server
   *
   */
  PM.prepare(config.watch);
  PM.startWatching();

  /** -- DEPLOY SETTINGS -----------------------------------------------------------------------------------------------
   *
   *	these are unique to each deploy/size/index
   *
   *
   */
  // deploy settings
  DM.deploy.prepare(
    _.merge(
      {
        // deploy profile
        profile: {
          name: "default",
          // the ad's environment can be specified by the deploy.
          // by default, it will be determined by the settings loaded from [settings.source.path]
          adEnvironment: {
            id: "debug",
            runPath: "",
            adPath: ""
          }
        },

        // source
        source: {
          context: "./1-build",
          size: "300x250",
          index: "index.html"
          // name: 'index' // if not specified, this will be derived from [source.index]
        },

        // output
        output: {
          debug: true,
          context: "./2-debug"
          // folder: '' // if not specified, this will be derived from [source.size]__[source.name]
        }
      },
      config.deploy
    )
  );
  log("\nDeploy:");
  log(DM.deploy.get());

  /** -- AD SETTINGS -----------------------------------------------------------------------------------------------
   *
   *	these settings are unique to framework
   *
   *
   */
  // ad settings
  DM.ad.prepare(
    _.merge(
      {
        settings: {
          // ** REQUIRED: where to load settings from
          source: {
            path: `${DM.deploy.get().source.context}/${
              DM.deploy.get().source.size
            }/${DM.deploy.get().source.index}`,
            type: "hooks" // default, json
          },
          // discovered ad.settings are added/maintained here
          ref: {}
        },

        // ** AD STRUCTURE: common locations
        paths: {
          // the subpaths for these standard locations can be set
          ad: {
            context: `${DM.deploy.get().source.size}`,
            js: "js",
            images: "images",
            videos: "videos"
          },
          common: {
            context: "common",
            js: "js",
            fonts: "fonts"
          },
          // `index.html?debug=true` will cause the ad to load from this location
          debug: {
            domain: "red.ff0000-cdn.net",
            path:
              `/_debug/${DM.deploy.get().profile.client}/${
                DM.deploy.get().profile.project
              }/` +
              `${DM.deploy.get().source.size}/${DM.deploy.get().source.index}`
          }
        },
        // ad.env is added here
        env: {}
      },
      config.ad
    )
  );
  // give deploy ability to override ad environment
  DM.ad.setAdEnvironment(
    DM.deploy.get().profile.adEnvironment,
    DM.deploy.get().output.debug
  );

  /*** LOAD EXTERNAL SETTINGS **/
  DM.ad.refresh();
  log("\nAd:");
  log(DM.ad.get());

  // indicates whether to inline assets as base64 into build
  // - foregoes creating an FBA payload
  const base64Inline = !!config.deploy.profile.base64Inline;

  // patterns that can be used w/ rollup-plugin-utils' createFilter util
  // (see: https://github.com/rollup/rollup-pluginutils)
  // accepts either a RegExp, glob/minimatch pattern, or an array of either of the types mentioned
  // also allows for optional query strings
  const imageIncludes = /\.(png|jpg|gif|svg)(\?.*)?$/;
  const fontIncludes = /\.(ttf|woff)(\?.*)?$/;

  /** -- PAYLOAD SETTINGS -----------------------------------------------------------------------------------------------
   *
   *	these settings are unique to packaging-style
   *
   *
   */
  DM.payload.prepare(
    _.merge(
      {
        // payload settings
        watchPaths: [
          path.resolve(`${scope}/${DM.ad.get().settings.source.path}`)
        ],
        entries: [
          {
            name: "inline",
            type: "inline",
            assets: {
              get: function() {
                return DM.ad
                  .get()
                  .settings.ref.assets.preloader.images.map(obj => {
                    return obj.source;
                  });
              },
              importPath: `./${DM.ad.get().paths.ad.images}`,
              requestPath: `${DM.ad.get().paths.ad.images}`
            }
          }
        ]
      },
      config.payload
    )
  );
  log("\nPayload:");
  log(DM.payload.get());

  /** -- BABEL -----------------------------------------------------------------------------------------------
   *
   *
   *
   */
  log(
    `using ${
      DM.deploy.get().output.debug ? "debug" : "production"
    } Babel settings`
  );

  const loaders = [
    // loads images and fonts
    {
      test: [].concat(imageIncludes).concat(fontIncludes),
      use: [
        {
          loader: "@ff0000-ad-tech/fba-loader",
          options: {
            emitFile: false,
            base64Inline,
            imageTypes: imageIncludes,
            fontTypes: fontIncludes
          }
        }
      ]
    }
  ];

  // FBA type objects used with binary-imports module
  // (https://github.com/ff0000-ad-tech/binary-imports)
  const fbaTypes = [
    {
      type: "fbAi",
      include: imageIncludes
    },
    {
      type: "fbAf",
      include: fontIncludes
    }
  ];

  const babelOptions = {
    presets: [
      [
        "@babel/preset-env",
        {
          /**
           * "Loose mode enables certain transformers to
           * generate cleaner output that lacks specific ES6 edgecases.
           * These edgecases are either unlikely to appear in your code
           * or the inclusion of them introduces significant overhead."
           *
           * See: https://developit.github.io/babel-legacy-docs//docs/advanced/loose/
           */
          loose: true
        }
      ]
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-object-rest-spread",
      "dynamic-import-webpack",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-transform-block-scoping"
    ]
  };

  // get Babel loaders based on environment (debug or production)
  const babelLoaderCreator = DM.deploy.get().output.debug
    ? DM.babel.debug
    : DM.babel.production;
  const babelLoaders = babelLoaderCreator({
    DM,
    babelOptions,
    imageIncludes,
    fontIncludes
  });
  var rules = [].concat(loaders).concat(babelLoaders);

  /** -- WEBPACK RUNTIME -----------------------------------------------------------------------------------------------
   *
   *
   *
   */
  /**
   * alias obj for config.resolve
   * will force all build node_modules to use only top-level packages
   * to allow for ad-specific hacks / non-published changes
   */
  const buildNodeModulesAliases = DM.aliases.getTopLevel(
    path.resolve(DM.deploy.get().source.context, "node_modules/@ff0000-ad-tech")
  );

  // build bundle entry path
  const buildEntry = path.resolve(
    scope,
    `${DM.deploy.get().source.context}/${DM.deploy.get().source.size}/Ad.js`
  );

  return {
    mode: DM.deploy.get().output.debug ? "development" : "production",
    entry: {
      // are injected into index.html, via wp-plugin-index
      initial: path.resolve(
        scope,
        `${
          DM.deploy.get().source.context
        }/node_modules/@ff0000-ad-tech/ad-entry/index.js`
      ),
      inline: path.resolve(
        scope,
        `${DM.deploy.get().source.context}/${
          DM.deploy.get().source.size
        }/.inline-imports.js`
      ),

      // is bundled & polite-loaded into index.html
      build: buildEntry
    },
    output: {
      path: path.resolve(
        scope,
        `${DM.deploy.get().output.context}/${DM.deploy.get().output.folder}`
      ),
      filename: "[name].bundle.js"
    },
    externals: {
      "ad-load": "adLoad"
    },
    resolve: {
      mainFields: ["module", "main", "browser"],
      alias: Object.assign(
        {
          AdData: path.resolve(
            scope,
            `${DM.deploy.get().source.context}/common/js/AdData`
          ),
          FtData: path.resolve(
            scope,
            `${DM.deploy.get().source.context}/common/js/FtData`
          ),
          GdcData: path.resolve(
            scope,
            `${DM.deploy.get().source.context}/common/js/GdcData`
          ),
          "@common": path.resolve(
            scope,
            `${DM.deploy.get().source.context}/common`
          ),
          "@size": path.resolve(
            scope,
            `${DM.deploy.get().source.context}/${DM.deploy.get().source.size}`
          )
        },
        buildNodeModulesAliases
      ),
      plugins: [
        new IndexVariationResolvePlugin(
          DM.deploy.get().source.index.replace(".html", "")
        )
      ]
    },
    module: {
      rules: rules
    },
    plugins: DM.plugins.getPlugins({
      DM,
      PM,
      buildEntry,
      fbaTypes,
      base64Inline,
      debug: DM.deploy.get().output.debug
    }),
    optimization: DM.optimization.getOptimization(),
    watch: DM.deploy.get().output.debug,
    devtool: DM.deploy.get().output.debug ? "source-map" : false
  };
};

module.exports = {
  execute
};
