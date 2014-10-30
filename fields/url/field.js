Formation.Fields.URL = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'URLInput';
  params.max = params.max || err( 'Please add a maximum length for this field greater than 0.' )
  params.fromDOM = function( value ){
    if (! this.required && value === '') return undefined;
    if (! this.required && value === undefined ) return undefined;
    return value.toString();
  }

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.URL( this.min, this.max ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.URL.prototype = Object.create( Formation.Field.prototype );
