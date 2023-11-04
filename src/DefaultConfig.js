// Core
import fs from "node:fs";
import path from "node:path";

// Plugins
import { copy } from "esbuild-plugin-copy";
import copyStaticFiles from "esbuild-copy-static-files";


const rootFiles = fs.readdirSync( `src${path.sep}`, { withFileTypes : true } );
const rootFilesToCopy = [];
for ( let ri = 0; ri < rootFiles.length; ri++ )
{
    if ( rootFiles[ ri ].isDirectory() )
    {
        continue;
    }

    // Note
    // It seems that the copy plugin requires normal slashes no matter what OS we are on
    rootFilesToCopy.push( `src/` + rootFiles[ ri ].name );
}

const buildDir = 'build';
const entryPoints = [
    path.resolve( './src/app/main.js' ),
    path.resolve( './src/app/app.css' )
    /*
    `.${path.sep}src${path.sep}app${path.sep}main.js`,
    `.${path.sep}src${path.sep}app${path.sep}app.css`
     */
];

const outDirDebug = `${buildDir}${path.sep}debug${path.sep}app${path.sep}`
const outDirRelease = `${buildDir}${path.sep}release${path.sep}app${path.sep}`;

const staticAssetsDestDebug = `${buildDir}${path.sep}debug${path.sep}assets`;
const staticAssetsDestRelease = `${buildDir}${path.sep}release${path.sep}assets`;

export default {
  "buildDir" : buildDir,
  "debug" : {
      "server" : {
          "indexType" : "html",
          "port" : 3000
      },
      "esbuild" : {
          bundle: true,
          sourcemap: true,
          minify: false,
          logLevel: "info",
          entryPoints : entryPoints,
          outdir : outDirDebug,
          loader: {
              ".html" : "text",
              ".png" : "file"
          },
          banner : {
              js: "(() => { (new EventSource(\"/esbuild\")).addEventListener('change', () => location.reload() ); })();"
          },
          plugins: [
              copy({
                  resolveFrom : 'cwd',
                  assets: [
                      {
                          from: rootFilesToCopy,
                          to: [`${buildDir}${path.sep}debug` ]
                      }
                  ]
              }),
              copyStaticFiles({
                  src: 'src/assets',
                  dest: staticAssetsDestDebug,
                  dereference: true,
                  errorOnExist: false,
                  preserveTimestamps: true,
                  recursive: true
              })
          ]
      },
  },
  "release" : {
      "esbuild" : {
          bundle: true,
          sourcemap: true,
          minify: true,
          logLevel: "error",
          entryPoints : entryPoints,
          outdir : outDirRelease,
          loader: {
              ".html" : "text",
              ".png" : "file"
          },
          plugins: [
              copy({
                  resolveFrom : 'cwd',
                  assets: [
                      {
                          from: rootFilesToCopy,
                          to: [`${buildDir}${path.sep}release` ]
                      }
                  ]
              }),
              copyStaticFiles({
                  src: 'src/assets',
                  dest: staticAssetsDestRelease,
                  dereference: true,
                  errorOnExist: false,
                  preserveTimestamps: true,
                  recursive: true
              })
          ]

      }
  }
};
