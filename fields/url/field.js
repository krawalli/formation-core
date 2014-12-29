Formation.Fields.URL = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'URLInput';
  params.min = params.min || 1;
  params.max = params.max || err( 'Please add a maximum length for this field greater than 0.' )

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
