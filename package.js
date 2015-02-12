Package.describe({
  name: "quietcreep:formation-core",
  summary: "Core objects for Formation for Meteor",
  version: "2.0.5_1",
  git: "http://github.com/quietcreep/formation-core",
  documentation: null,
});

var both = [ 'client', 'server' ];


Package.onUse( function( api ) {

  api.versionsFrom( 'METEOR@1.0.2.1' );
  api.use([ 'underscore', 'check', 'reactive-var', 'tracker' ], both );

  //// settings and setup ///////////
  api.addFiles( 'settings.js', both );
  api.addFiles( 'helpers.js', both );
  api.addFiles( 'errors.js', both );


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

  api.addFiles( 'fields/fieldInstance.js', both );
  api.addFiles( 'validators.js', both );

  //// models ///////////////////////
  api.addFiles( 'models/model.js', both );
  api.addFiles( 'models/modelInstanceSuper.js', both );
  api.addFiles( 'models/modelInstance.js', both );
  api.addFiles( 'models/newModelInstance.js', both );
  api.addFiles( "saving.js", 'server' );

  api.export( 'Formation' );

});



Package.onTest( function( api ) {
  api.use([ 'tinytest', 'test-helpers', 'underscore', 'quietcreep:formation-core' ], both );
  api.addFiles( 'tests/saving.js' );
  api.addFiles( 'tests/getValue.js' );
  api.addFiles( 'tests/errors.js' );
});
