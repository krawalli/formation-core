/* EJSON field  */
Formation.Fields.EJSON = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'TextInput';
  params.defaultValue = params.defaultValue || EJSON.parse('{}');

  params.fromDOM = function( value ){
    var result = value;
    if (! this.required && ! value ) return undefined;
    if (!_.isObject(value)) {
      try {
        result = EJSON.parse(value);
      } catch (error) {
        // console.log('error while EJSON parsing', error);
        // TODO: @quietcreep
        // how to handle the case where we want to save an object but display a string?
      }
      return result;
    }
    return result;
  };

  params.toDOM = function(value){
    return EJSON.stringify(this.getValue());
  };

  Formation.Field.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      return this._optional( Formation.Validators.EJSON() );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.EJSON.prototype = Object.create( Formation.Field.prototype );
