function err( msg ){ throw new Error( msg ) }

Meteor.methods({
  'S3Configure': function( params ){
    var bucket = params.bucket || err( "Please include an S3 'bucket' name" );
    var accessKeyId = params.bucket || err( "Please include an S3 'accessKeyId'" );
    var secretAccessKey = params.bucket || err( "Please include an S3 'secretAccessKey'" );

    if ( Meteor.isServer ){
      Formation.Settings.S3.accessKeyId = accessKeyId;
      Formation.Settings.S3.secretAccessKey = secretAccessKey;
    }

    Formation.Settings.S3.bucket = bucket;

  }
})
