Formation.Fields.Number = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || "NumberInput";
  params.min = typeof( params.min ) === 'number' ? params.min : null;
  params.fromDOM = function( value ){
    if (! this.required && ( value === '' || value === null || value === undefined ) )
      return undefined;
    var val = +value;
    if (! val && val !== 0 ) val = undefined;
    return val;
  };
  var stepSize = typeof params.stepSize === "number" ? params.stepSize : 1;

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.BasicNumber( this.min, this.max ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });

  Object.defineProperty( this, "stepSize", { value: stepSize } );
};

Formation.Fields.Number.prototype = Object.create( Formation.Field.prototype );




Formation.Fields.NumberArray = function Field( params ){
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
  };
  params.fromDOM = function( value ){
    if (! this.required && ( value === "" || value === null || value === undefined ) ) return undefined;
    if (! this.required && ! this.length ) return undefined;

    var cleanValue = value.split( this.field.delimiter );
    for ( var i=0; i < cleanValue.length; i++ ){
      cleanValue[ i ] = +cleanValue[ i ].trim();
    }
    return cleanValue;
  };

  Formation.Field.call( this, params );

  Object.defineProperties( this, {
    delimiter: { value: params.delimiter || ',' },
    pattern: { value: function(){
      return this._optional( Formation.Validators.NumberArray( this.min, this.max ) );
    }}
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.NumberArray.prototype = Object.create( Formation.Field.prototype );
