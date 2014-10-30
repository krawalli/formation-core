Formation.Fields.FileUpload = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || "FileInput";

  Formation.Field.call( this, params );

  Object.defineProperties( this, {
    uploadTo: { value: params.uploadTo || err( "Please enter a path to upload to." ) },
    fileTypes: { value: params.fileTypes || [] },
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
