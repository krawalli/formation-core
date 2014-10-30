////////////////////////////////////
////  Basic fields
////////////////////////////////////


/* Char field  */
Formation.Fields.Char = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'TextInput';
  params.max = params.max || err( 'Please add a maximum length for this field greater than 0.' )
  params.fromDOM = function( value ){
    if (! this.required && value === '') return undefined;
    return value.toString();
  }

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.BasicChar( this.min, this.max ) );
    }
  });

  Object.defineProperties( this, {
    rows: { value: params.rows || 4 },
    instance: { value: Formation.FieldInstance({ field: this }) }
  });

}

Formation.Fields.Char.prototype = Object.create( Formation.Field.prototype );




Formation.Fields.CharArray = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'TextArray';
  var defVal = function(){
    if ( params.defaultValue instanceof Array ){
      return params.defaultValue
    } else {
      return undefined
    }
  };

  params.defaultValue = typeof( params.defaultValue ) === "function" ? params.defaultValue : defVal;

  params.toDOM = function(){
    if ( this.getValue() instanceof Array ){
      return this.getValue().join( this.field.delimiter + ' ' );
    }
  }
  params.fromDOM = function( value ){
    if ( value === "" ) return undefined;

    var cleanValue = value.split( this.field.delimiter );
    for ( var i=0; i < cleanValue.length; i++ ){
      cleanValue[ i ] = cleanValue[ i ].trim();
    }
    return cleanValue;
  };

  Formation.Field.call( this, params );

  Object.defineProperties( this, {
    delimiter: { value: params.delimiter || ',' },
    pattern: { value: function(){
      return this._optional( Formation.Validators.CharArray( this.min, this.max ) );
    }},
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.CharArray.prototype = Object.create( Formation.Field.prototype );
