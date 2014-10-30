
Formation.camelToSlug = function( str ) {
  // Separate camel-cased words with a space for later processing.
  str = str.replace( /[A-Z]/g, function( s ){  return " " + s; });
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;",
      to   = "aaaaeeeeiiiioooouuuunc------";
  for ( var i=0, l=from.length; i<l; i++ ){
    str = str.replace( from[ i ], to[ i ] );
  }

  str = str.replace( /[^a-z0-9 -]/g, '' ) // remove invalid chars
  .replace( /\s+/g, '-' ) // collapse whitespace and replace by -
  .replace( /-+/g, '-'); // collapse dashes

  // Trim leading and trailing whitespace and dashes.
  str = str.replace(/^[\s|-]+|[\s|-]+$/g, '');

  return str;
};


Formation.Fields.Slug = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'SlugInput';
  params.fromDOM = function( value ){
    return Formation.camelToSlug( value );
  };
  params.max = params.max || err( 'Please add a maximum length for this field greater than 0.' )

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.Slug( this.min, this.max ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this }),
  });
};

Formation.Fields.Slug.prototype = Object.create( Formation.Field.prototype );
