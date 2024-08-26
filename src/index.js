#! /usr/bin/env node

import fs from "node:fs";
import ejs from "ejs";

import _ from "lodash";
import prettier from "prettier";
import { program } from "commander";
import path from "node:path";

import frontFire from "./FrontFire.js";
import defaultConfig from "./DefaultConfig.js";

import wcIndex from "./templates/wc-index.js";
import wcTemplate from "./templates/wc-template.html.js";

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

async function createInfrontJsStarter( appName = null )
{
    // Deep Copy
    const initConfig = JSON.parse( JSON.stringify( defaultConfig ) );

    _.unset( initConfig, 'debug.esbuild.plugins' );
    _.unset( initConfig, 'release.esbuild.plugins' );

    if ( null === appName || appName.length === 0 )
    {
        appName = 'InfrontJS Starter';
    }

    const srcFolder = path.resolve( '.' ) + path.separator + 'src-to-test';

    if ( true === fs.existsSync( srcFolder ) )
    {
        console.warn( `Sourcefolder ${srcFolder} already exists!` );
        return;
    }
}

async function generatesWebComponent( name = null )
{
    let fileName = null;
    let className = null;
    let wcName = null;

    // Deep Copy
    const initConfig = JSON.parse( JSON.stringify( defaultConfig ) );

    _.unset( initConfig, 'debug.esbuild.plugins' );
    _.unset( initConfig, 'release.esbuild.plugins' );

    if ( null === name || name.length === 0 )
    {
        console.error( 'V')
    }

    fileName = name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    className = fileName.charAt( 0 ).toUpperCase() + fileName.slice( 1 );
    wcName = name.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase());
    fileName = fileName.charAt(0).toLowerCase() + fileName.slice(1);

    const srcFolder = path.resolve( '.' ) + path.sep + fileName;
    if ( true === fs.existsSync( srcFolder ) )
    {
        console.error( `Folder "${srcFolder}" already exists!` );
        return false;
    }

    fs.mkdirSync ( srcFolder ) ;
    fs.writeFileSync(
        srcFolder + path.sep + 'index.js',
        ejs.render( wcIndex, { wcName: wcName, className: className } )
    );
    fs.writeFileSync(
        srcFolder + path.sep + 'template.js',
        ejs.render( wcTemplate, { wcName: wcName } )
    );

    console.log( `Web component ${wcName} successfully created.` );
}

// Try to load custom config
let customConfig = null;

if ( fs.statSync( 'frontfire.json', { "throwIfNoEntry": false } ) )
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
    .command( 'create' )
    .description( 'Creates starter InfrontJS application.' )
    .action( function() { createInfrontJsStarter(); } );

program
    .command( 'gwc' )
    .argument( '<name>', 'Name of web component.' )
    .description( 'Generates a webcomponent with specific name.' )
    .action( function( name ) { generatesWebComponent( name ); } );


program
    .command( 'build' )
    .description( 'Building for production.' )
    .action( function() { frontFire( false, customConfig ); } );


program.parse();
