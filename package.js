Package.describe({
  name: "quietcreep:formation-core",
  summary: "Core objects for Formation for Meteor",
  version: "1.1.0",
  git: "http://github.com/quietcreep/formation-core"
});


Package.onUse( function( api ) {

  api.versionsFrom( 'METEOR@1.0.2.1' );

  var both = [ 'client', 'server' ];
  api.use([ 'underscore', 'check', 'reactive-var', 'tracker' ], both );

  //// settings and setup ///////////
  api.addFiles( 'settings.js', both );

  //// fields ///////////////////////
  var fields = [
    'boolean',
    'char',
    'choice',
    'date',
    'datetime',
    'email',
    'modelChoice',
    'number',
    'password',
    'slug',
    'time',
    'url'
  ];

  api.addFiles( 'fields/field/field.js', both );

  for ( var i=0; i < fields.length; i++ ){
    api.addFiles( 'fields/'+ fields[ i ] +'/field.js', both );
  }

  api.addFiles( 'fieldInstance.js', both );
  api.addFiles( 'validators.js', both );

  //// models ///////////////////////
  api.addFiles( 'model.js', both );
  api.addFiles( 'modelSuper.js', both );
  api.addFiles( 'modelInstance.js', both );
  api.addFiles( 'newModelInstance.js', both );


  api.export( 'Formation' );

});


Package.onTest( function( api ) {
  // api.use( 'tinytest' );
  // api.use( 'quietcreep:formation' );
  // api.addFiles( 'quietcreep:formation-tests.js' );
});
