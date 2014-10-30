Formation.Fields.Datetime = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || "DatetimeInput";

  params.toDOM = function(){
    if ( this.getValue() ){
      value = new Date( this.getValue() );
      return value.toLocaleString();
    }
    return;
  };
  params.fromDOM = function( value ){
    if (! value && ! this.required ) return undefined;
    var returnValue = value instanceof Date ? value : new Date( value );
    return returnValue;
  };

  var today = new Date();
  params.min = params.min instanceof Date ? params.min : new Date( today.getFullYear()-115 + "-01-01" );
  params.max = params.min instanceof Date ? params.max : new Date( today.getFullYear()+50 + "-01-01" );

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.Date( this.min, this.max ) );
    }
  })

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.Datetime.prototype = Object.create( Formation.Field.prototype );
