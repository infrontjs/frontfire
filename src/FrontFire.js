const esbuild = require( "esbuild" );
const { copy } = require( "esbuild-plugin-copy" );
const copyStaticFiles = require( "esbuild-copy-static-files" );
const http = require( "node:http" );
const fs = require( 'node:fs' );
const path = require( 'node:path' );

const rootBuildDir = 'build';

try
{
    if ( fs.statSync( rootBuildDir ) )
    {
        console.log( "Cleaning build directory: " + rootBuildDir );
        fs.rmSync( rootBuildDir, { recursive: true, force: true } );
    }
}
catch( ie )
{
    // Fail silently
    console.error( ie );
}

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

async function frontFire( isWatch )
{
    let opts = {
        // esbuild options
        bundle: true,
        sourcemap: true,
        minify: isWatch ? false : true,
        logLevel: isWatch ? "info" : "error",
        entryPoints : [ `src${path.sep}app${path.sep}main.js`, `src${path.sep}app${path.sep}app.css` ],
        outdir : isWatch ? `${rootBuildDir}${path.sep}debug${path.sep}app${path.sep}` : `${rootBuildDir}${path.sep}release${path.sep}app${path.sep}`,
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
                        to: [ isWatch ? `${rootBuildDir}${path.sep}debug` : `${rootBuildDir}${path.sep}release` ]
                    }
                ]
            }),
            copyStaticFiles({
                src: 'src/assets',
                dest: isWatch ? `${rootBuildDir}${path.sep}debug${path.sep}assets` : `${rootBuildDir}${path.sep}release${path.sep}assets`,
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
            js: "(() => { (new EventSource(\"/esbuild\")).addEventListener('change', () => location.reload() ); })();"
        };
    }

    let ctx = await esbuild.context( opts );

    if ( true === isWatch )
    {
        console.log( "Adding additional watcher..." );
        fs.watchFile( `src${path.sep}index.html`, async ( curr, prev ) =>
        {
            console.log( "Index.html changed..." );
            const result = await ctx.rebuild();
            console.log( result );
        });
        await ctx.watch();
        let { host, port } = await ctx.serve(
            {
                servedir : `.${path.sep}${rootBuildDir}${path.sep}debug`
            }
        );


        let sseResponse = null;
        /*
        // DOES NOT WORK
        setInterval( () =>
        {
            console.log( "Sending sse..." );
            sseResponse.write( 'data: esbuild' );
        }, 5000 );
         */

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

                if ( req.url === '/esbuild' )
                {
                    sseResponse = res;
                }

                proxyRes.pipe(res, { end: true })
            });

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
