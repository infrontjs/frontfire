import _ from "lodash";
import esbuild from "esbuild";
import http from "node:http";
import fs from "node:fs";
import fse from "fs-extra";
import path from "node:path";
import * as child from "child_process";

import { DateTime } from "luxon";

import DEFAULT_CONFIG from "./DefaultConfig.js";

export default async function frontFire( isWatch, cfg = {} )
{
    const config = _.merge( DEFAULT_CONFIG, cfg );

    const indexType = _.get( config, 'debug.server.indexType', 'html' );

    const rootBuildDir = _.get( config, 'buildDir', null );
    if ( null === rootBuildDir )
    {
        throw new Error( 'No valid buildDir.' );
    }


    fse.ensureDirSync( rootBuildDir );
    fse.ensureDirSync( `${rootBuildDir}${path.sep}debug` );
    fse.ensureDirSync( `${rootBuildDir}${path.sep}release` );

    try
    {
        let dirToDelete = isWatch ? 'debug' : 'release';
        dirToDelete = `${rootBuildDir}${path.sep}${dirToDelete}`;

        if ( fs.statSync( dirToDelete ) )
        {
            fs.rmSync( dirToDelete, { recursive: true, force: true } );
        }
    }
    catch( ie )
    {
        // Fail silently
        console.error( ie );
    }

    let esbuildOpts = null;
    let serverOpts = null;

    if ( true === isWatch )
    {
        esbuildOpts = _.get( config, 'debug.esbuild' );
        serverOpts = _.get( config, 'debug.server' );
    }
    else
    {
        esbuildOpts = _.get( config, 'release.esbuild' );
    }

    let ctx = await esbuild.context( esbuildOpts );

    if ( true === isWatch )
    {
        const outerPort = serverOpts && serverOpts.hasOwnProperty( 'port' ) ? +serverOpts.port : 3000;
        fse.copySync( 'src', `${rootBuildDir}${path.sep}debug` );
        fs.watchFile( `src${path.sep}index.html`, async ( curr, prev ) =>
        {
            const result = await ctx.rebuild();
        });
        await ctx.watch();
        let { host, port } = await ctx.serve(
            {
                servedir : `.${path.sep}${rootBuildDir}${path.sep}debug`,
                // @todo use param for index.html
                fallback : `.${path.sep}${rootBuildDir}${path.sep}debug${path.sep}index.html`
                //onRequest : function (  ) {  console.log( "Hello" ); }
            }
        );

        // Then start a proxy server
        http.createServer((req, res) => {

            const options = {
                hostname: host,
                port: port,
                path: req.url,
                method: req.method,
                headers: req.headers
            };

            if ( 'php' === indexType && req.url === "/" && req.method.toLowerCase() === 'get' )
            {
                const indexHtml = child.execSync( `php src${path.sep}index.php`);
                res.writeHead( 200, { 'Content-Type': 'text/html' });
                res.end( indexHtml.toString() );
                return;
            }

            // Check if path is a valid state route
            // then pass it as "index.html" to the server

            // Forward each incoming request to esbuild
            const proxyReq = http.request(options, proxyRes => {
                // If esbuild returns "not found", send a custom 404 page
                if (proxyRes.statusCode === 404) {
                    res.writeHead(404, { 'Content-Type': 'text/html' })
                    res.end('<h1>A custom 404 page</h1>');
                    return;
                }

                // Otherwise, forward the response from esbuild to the client
                res.writeHead(proxyRes.statusCode, proxyRes.headers);

                proxyRes.pipe(res, { end: true })
            });

            // Forward the body of the request to esbuild
            req.pipe(proxyReq, { end: true })

        }).listen( outerPort );

        console.log( `> InfrontJS:http://localhost:${outerPort}` );
    }
    else
    {
        fse.copySync( `src${path.sep}index.html`, `${rootBuildDir}${path.sep}release${path.sep}index.html` );
        await ctx.rebuild();
        ctx.dispose();

        // CACHEBREAK
        let indexContent = fs.readFileSync( `${rootBuildDir}${path.sep}release${path.sep}index.html`,  { encoding: 'utf8', flag: 'r' } );
        const changedContent = indexContent.replace( /INFRONTCACHEBREAK/g, (DateTime.now()).valueOf() );
        fs.writeFileSync( `${rootBuildDir}${path.sep}release${path.sep}index.html`, changedContent );
    }
};
