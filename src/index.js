#! /usr/bin/env node
const { program } = require( 'commander' );
const frontFire = require( "./FrontFire.js" );

program
    .command( 'run-dev' )
    .description( 'Running development server.' )
    .action( function() {frontFire( true ); } );

program
    .command( 'build' )
    .description( 'Building for production.' )
    .action( function() {frontFire( false ); } );


program.parse();
