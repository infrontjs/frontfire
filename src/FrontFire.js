const esbuild = require( "esbuild" );
const { copy } = require( "esbuild-plugin-copy" );
const copyStaticFiles = require( "esbuild-copy-static-files" );
const http = require( "node:http" );

const rootBuildDir = 'build';

// @todo Add PATH_SEPERATOR for paths

async function frontFire( isWatch )
{
    let opts = {
        // esbuild options
        bundle: true,
        sourcemap: true,
        minify: isWatch ? false : true,
        logLevel: isWatch ? "info" : "error",
        entryPoints : [ 'src/main.js', 'src/style.css' ],
        outdir : isWatch ? `${rootBuildDir}/debug/bundles/` : `${rootBuildDir}/release/bundles`,
        loader: {
            ".html" : "text",
            ".png" : "file"
        },
        plugins: [
            copy({
                resolveFrom : 'cwd',
                assets: [
                    {
                        from: [ 'src/index.html' ],
                        to: [ isWatch ? `${rootBuildDir}/debug/` : `${rootBuildDir}/release/` ]
                    }
                ]
            }),
            copyStaticFiles({
                src: 'src/assets',
                dest: isWatch ? `${rootBuildDir}/debug/assets` : `${rootBuildDir}/release/assets`,
                dereference: true,
                errorOnExist: false,
                preserveTimestamps: true,
                recursive: true
            })
        ]

    };

    if ( true === isWatch )
    {
        opts[ "banner" ] = {
            js: "(() => { (new EventSource(\"/esbuild\")).addEventListener('change', () => location.reload()); })();"
        };
    }

    let ctx = await esbuild.context( opts );

    if ( true === isWatch )
    {
        await ctx.watch();
        let { host, port } = await ctx.serve(
            {
                servedir : `./${rootBuildDir}/debug`
            }
        );

        // Then start a proxy server on port 3000
        http.createServer((req, res) => {

            const options = {
                hostname: host,
                port: port,
                path: req.url,
                method: req.method,
                headers: req.headers,
            }

            // Check if path is a valid state route
            // then pass it as "index.html" to the server

            // Forward each incoming request to esbuild
            const proxyReq = http.request(options, proxyRes => {
                // If esbuild returns "not found", send a custom 404 page
                if (proxyRes.statusCode === 404) {
                    res.writeHead(404, { 'Content-Type': 'text/html' })
                    res.end('<h1>A custom 404 page</h1>')
                    return
                }

                // Otherwise, forward the response from esbuild to the client
                res.writeHead(proxyRes.statusCode, proxyRes.headers)

                proxyRes.pipe(res, { end: true })
            })

            // Forward the body of the request to esbuild
            req.pipe(proxyReq, { end: true })

        }).listen(3000);

        console.log( '> InfrontJS:http://localhost:3000' );
    }
    else
    {
        await ctx.rebuild();
        ctx.dispose();
    }
}

module.exports = frontFire;
