Formation.Fields.Date = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || "DateInput";

  params.toDOM = function(){
    if ( this.getValue() ){
      value = new Date( this.getValue() );
      return value.toLocaleDateString();
    }
    return;
  };
  params.fromDOM = function( value ){
    if (! value && ! this.required ) return undefined;
    var returnValue = value instanceof Date ? value : new Date( value );
    returnValue.setHours( 0, 0, 1 );
    return returnValue;
  }

  var today = new Date();
  params.min = params.min instanceof Date ? params.min.getTime() : new Date( today.getFullYear()-115 + "-01-01" ).getTime();
  params.max = params.max instanceof Date ? params.max.getTime() : new Date( today.getFullYear()+50 + "-01-01" ).getTime();

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.Date( this.min, this.max ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.Date.prototype = Object.create( Formation.Field.prototype );
