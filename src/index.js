#! /usr/bin/env node

import fs from "node:fs";

import _ from "lodash";
import prettier from "prettier";
import { program } from "commander";

import frontFire from "./FrontFire.js";
import defaultConfig from "./DefaultConfig.js";

async function performInit()
{
    // Deep Copy
    const initConfig = JSON.parse( JSON.stringify( defaultConfig ) );

    _.unset( initConfig, 'debug.esbuild.plugins' );
    _.unset( initConfig, 'release.esbuild.plugins' );

    fs.writeFileSync(
        'frontfire.json',
        prettier.format(
            JSON.stringify( initConfig ),
            {
                semi: false,
                parser: "json"
            }
        )
    );
}

// Try to load custom config
let customConfig = null;

if ( fs.statSync( 'frontfire.json' ) )
{
    customConfig = fs.readFileSync( 'frontfire.json' );
    if ( customConfig )
    {
        try
        {
            customConfig = JSON.parse( customConfig );
        }
        catch( e )
        {
            console.warn( 'Cannot read frontfire.json' );
            customConfig = null;
        }
    }
}

program
    .command( 'run-dev' )
    .description( 'Running development server.' )
    .action( function() { frontFire( true, customConfig ); } );

program
    .command( 'init' )
    .description( 'Creates frontfire default configuration file in current directory.' )
    .action( function() { performInit(); } );


program
    .command( 'build' )
    .description( 'Building for production.' )
    .action( function() { frontFire( false, customConfig ); } );


program.parse();
