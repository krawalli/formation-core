Formation.Fields.FileUpload = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || "FileInput";
  params.type = _.contains( DATA_TYPES, params.type ) ? params.type : 'text';
  params.bucket = params.bucket || Formation.Settings.S3.bucket || err( "Please set an S3 bucket to upload to." );
  params.uploadTo = params.uploadTo || err( "Please enter a path to upload to." );

  if ( params.uploadTo.indexOf( '/' ) === 0 ) params.uploadTo = params.uploadTo.slice(1);
  if ( params.uploadTo.indexOf( '/' ) !== params.uploadTo.length-1 ) params.uploadTo += '/';

  Formation.Field.call( this, params );

  Object.defineProperties( this, {
    uploadTo: { value: params.uploadTo },
    type: { value: params.type },
    bucket: { value: params.bucket },
    pattern: { value: function(){
      return this._optional( Formation.Validators.FileUpload() );
    }},
    contentType: { value: params.contentType },
  })

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.FileUpload.prototype = Object.create( Formation.Field.prototype );


var DATA_TYPES = [
  'application',
  'audio',
  'image',
  'message',
  'model',
  'text',
  'video'
];

function err( msg ){ throw new Error( msg ) }
