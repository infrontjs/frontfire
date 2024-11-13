#! /usr/bin/env node

import fs from "node:fs";
import { readdir, readFile } from 'node:fs/promises';
import ejs from "ejs";
import chalk from "chalk";

import _ from "lodash";
import prettier from "prettier";
import { program } from "commander";
import path from "node:path";

import frontFire from "./FrontFire.js";
import defaultConfig from "./DefaultConfig.js";

import wcIndex from "./templates/wc-index.js";
import wcTemplate from "./templates/wc-template.html.js";
import stateClass from "./templates/state-class.js";
import stateTemplate from "./templates/state-template.html.js";
import poIndex from "./templates/po-index.js";
import dictTemplate from "./templates/dictionary.js";

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

    if ( false === fs.existsSync( './src/assets' ) )
    {
        fs.mkdirSync( './src/assets' );
    }
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

async function generatesPathObject( name )
{
    let fileName = null;
    let poName = null;

    fileName = name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    poName = fileName.charAt( 0 ).toUpperCase() + fileName.slice( 1 );

    const poFilename = path.resolve( '.' ) + path.sep + poName + '.js';
    if ( true === fs.existsSync( poFilename ) )
    {
        console.error( `File "${poFilename}" already exists!` );
        return false;
    }

    fs.writeFileSync(
        poFilename,
        ejs.render( poIndex, { poName: poName } )
    );

    console.log( chalk.green.bold( `PathObject ${poName} successfully generated.`) );
}

async function generatesState( name, options )
{
    let fileName = null;
    let stateName = null;
    let stateId = null;

    fileName = name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    stateName = fileName.charAt( 0 ).toUpperCase() + fileName.slice( 1 );
    stateId = stateName.replace(/[A-Z]/g, (match, offset) => (offset > 0 ? '-' : '') + match.toLowerCase());

    const stateFilename = path.resolve( '.' ) + path.sep + stateName + 'State.js';
    if ( true === fs.existsSync( stateFilename ) )
    {
        console.error( `File "${stateFilename}" already exists!` );
        return false;
    }

    const stateTemplatename = path.resolve( '.' ) + path.sep + stateName + 'Template.html';
    if ( true === options.template && true === fs.existsSync( stateTemplatename ) )
    {
        console.error( `File "${stateTemplatename}" already exists!` );
        return false;
    }

    fs.writeFileSync(
        stateFilename,
        ejs.render( stateClass, { stateName: stateName, stateId : stateId } )
    );
    fs.writeFileSync(
        stateTemplatename,
        ejs.render( stateTemplate, { stateName: stateName } )
    );

    console.log( chalk.green.bold( `State ${stateName} successfully generated.`) );
    console.log( chalk.italic( 'Dont forget to add the state to your states instance, e.g.' ) );
    console.log( chalk.italic.bgWhite( `myApp.states.add( ${stateName} );`) );
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

    const srcFolder = path.resolve( '.' ) + path.sep + wcName;
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
        srcFolder + path.sep + 'template.html',
        ejs.render( wcTemplate, { wcName: wcName } )
    );

    console.log( chalk.green.bold( `Web component ${wcName} successfully created.` ) );
}

async function generateDictionary( pathToDictionary, options )
{
    const defaultLang = 'en';
    const countryCodes = options.countrycodes.split( "," );
    const defaultCountryCode = options.defaulcountrycode;
    const rootFolder = path.resolve( options.rootpath );
    const newDict = [];
    const lKeys = [];
    let currentDict = {};

    const indexOfDefaultLang = countryCodes.indexOf( defaultLang );
    if ( -1 < indexOfDefaultLang )
    {
        countryCodes.splice( indexOfDefaultLang, 1 );
    }

    try
    {
        if ( fs.existsSync( pathToDictionary ) )
        {
            let dictContent = fs.readFileSync( pathToDictionary, { encoding: 'utf8' } );
            dictContent = dictContent.replace( "export default", "" );
            dictContent = dictContent.trim();
            dictContent = dictContent.replace( new RegExp(';$', 'gm'), "" );
            try {
                currentDict = JSON.parse( dictContent );
            } catch( e ) {
                console.error( `Cannot parse current dictionary.`, e );
                currentDict = {};
            }
        }

        const files = await readdir( rootFolder, { recursive : true } );
        for ( let fi = 0; fi < files.length; fi++ )
        {
            const file = files[ fi ];
            if ( false === fs.lstatSync( file ).isFile() )
            {
                continue;
            }

            const regex = /_lcs\(\s*?[\'|\"|\`](.+)[\'|\"|`]\s*?\)/gm;
            if ( -1 < [ '.html', '.js' ].indexOf( ( '.' +  file.split( '.' ).pop() ) ) )
            {
                const str = await readFile( file, 'utf8' );

                let m;
                while ((m = regex.exec(str)) !== null) {

                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, groupIndex) => {

                        if ( false === match.includes( '_lcs' ) )
                        {
                            if ( -1 === lKeys.indexOf( match ) )
                            {
                                lKeys.push( match );
                                let newEntry = { "key" : match, trans : [] };
                                if ( currentDict.hasOwnProperty( match ) && currentDict[ match ].hasOwnProperty( defaultCountryCode ) && currentDict[ match ][ defaultCountryCode ] !== null )
                                {
                                    newEntry.trans.push( { "cc" : defaultCountryCode, "val" : currentDict[ match ][ defaultCountryCode ] } );
                                }
                                else
                                {
                                    newEntry.trans.push( { "cc" : defaultCountryCode, "val" : match } );
                                }

                                for ( let ci = 0; ci < countryCodes.length; ci++ )
                                {
                                    if ( currentDict.hasOwnProperty( match ) && currentDict[ match ].hasOwnProperty( countryCodes[ ci ] ) && currentDict[ match ][ countryCodes[ ci ] ] !== null )
                                    {
                                        newEntry.trans.push( { "cc" : countryCodes[ ci ], "val" : currentDict[ match ][ countryCodes[ ci ] ] } );
                                    }
                                    else
                                    {
                                        newEntry.trans.push( { "cc" : countryCodes[ ci ], "val" : null } );
                                    }
                                }
                                newDict.push( newEntry );
                            }
                        }
                    });
                }
            }
        }

        const newDictFileContent = ejs.render( dictTemplate, { newDict: newDict } );
        fs.writeFileSync( pathToDictionary, newDictFileContent, { encoding: 'utf8' } );

        console.log( chalk.green.bold( `Dictionary successfully created under ${pathToDictionary}. Total keys: ${newDict.length}.` ) );
    }
    catch( e )
    {
        console.error( e );
    }
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
    .command( 'gd' )
    .argument( '<pathToDictionary>', 'Path to dictionary file. If it exists, it gets overwritten.' )
    .option( '-cc, --countrycodes <ccodes>', 'Comma seperated list of country codes.', 'en,de' )
    .option( '-dcc, --defaulcountrycode <ccode>', 'Default country code', 'en' )
    .option( '-rp, --rootpath <rootpath>', 'Root path to parse files for translations.', './' )
    .description( 'Generates a dictionary file.' )
    .action( function( pathToDictionary, options ) { generateDictionary( pathToDictionary, options ); } );

program
    .command( 'gs' )
    .argument( '<name>', 'Name of state.' )
    .option( '-nt, --no-template', 'No template is generated. By default, an empty template for the State is autogenerated.' )
    .description( 'Generates a new state.' )
    .action( function( name, options ) { generatesState( name, options ); } );

program
    .command( 'gpo' )
    .argument( '<name>', 'Name of path object.' )
    .description( 'Generates a new path object.' )
    .action( function( name ) { generatesPathObject( name ); } );

program
    .command( 'build' )
    .description( 'Building for production.' )
    .action( function() { frontFire( false, customConfig ); } );


program.parse();
