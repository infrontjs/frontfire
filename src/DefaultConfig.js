/*
// Core
import fs from "node:fs";
import path from "node:path";

// Plugins
import { copy } from "esbuild-plugin-copy";
import copyStaticFiles from "esbuild-copy-static-files";

let currentDir = path.dirname( '.' );
let rootDir = null;
const maxCount = 10;
let currentCount = 0;
while ( null === rootDir )
{
    if ( fs.existsSync( currentDir + path.sep + 'package.json' ) )
    {
        rootDir = currentDir;
    }
    else
    {
        currentDir += '/..';
        currentCount++;
        if ( currentCount > maxCount ) {
            break;
        }
    }
}

if ( rootDir === null )
{
    console.error( 'Too many recursions. Root directory not found.' );
    exit;
}

const rootFiles = fs.readdirSync( `${rootDir}${path.sep}src${path.sep}`, { withFileTypes : true } );
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

const buildDir = `build`;
const entryPoints = [
    `./src/app/main.js`,
    `./src/app/main.css`
];

const outDirDebug = `${buildDir}/debug/app/`
const outDirRelease = `${buildDir}/release/app`;

const staticAssetsDestDebug = `${buildDir}/debug/assets`;
const staticAssetsDestRelease = `${buildDir}/release/assets`;
*/
export default {
  "buildDir": "build",
  "debug": {
    "server": { "indexType": "html", "port": 3000 },
    "esbuild": {
      "bundle": true,
      "sourcemap": true,
      "minify": false,
      "logLevel": "info",
      "entryPoints": [".\\src\\app\\main.js", ".\\src\\app\\main.css"],
      "outdir": "build/debug/app/",
      "loader": { ".html": "text", ".png": "file" },
      "banner": {
        "js": "(() => { (new EventSource(\"/esbuild\")).addEventListener('change', () => location.reload() ); })();"
      }
    }
  },
  "release": {
    "esbuild": {
      "bundle": true,
      "sourcemap": true,
      "minify": true,
      "logLevel": "error",
      "entryPoints": [".\\src\\app\\main.js", ".\\src\\app\\main.css"],
      "outdir": "build/release/app",
      "loader": { ".html": "text", ".png": "file" }
    }
  }
};
