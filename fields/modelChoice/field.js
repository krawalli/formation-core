////////////////////////////////////
////  Model choice fields
////////////////////////////////////


var ModelChoiceField = function Field( params ){
  params = typeof params === "object" ? params : {};

  Formation.Field.call( this, params );

  Object.defineProperties( this, {
    model: { value: typeof params.model === 'function' ? params.model() : params.model },
    filter: { value: typeof params.filter === 'function' ? params.filter : function(){ return params.filter || {} } },
    options: { value: params.options || {} },
    choices: { value: function(){
      return this.model.find( this.filter(), this.options );
    }}
  });
};

ModelChoiceField.prototype = Object.create( Formation.Field.prototype );


/* Single Model Choice  */
Formation.Fields.ModelSingleChoice = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'ModelRadioInput';
  params.toDOM = function(){
    var instance = this.field.model.findOne({ _id: this.value });
    return instance;
  };

  ModelChoiceField.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      var c = _.reduce( this.choices(), function( memo, value ){
        memo.push( value._id );
        return memo;
      }, [] );
      return this._optional( Formation.Validators.ValueIsInChoices( c ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.ModelSingleChoice.prototype = Object.create( ModelChoiceField.prototype );



/* Multiple Model Choice  */
Formation.Fields.ModelMultipleChoice = function Field( params ){
  params = typeof params === "object" ? params : {};
  params.widget = params.widget || 'ModelSelectMultiple';
  params.min = params.min && params.required === true ? params.min : 0;
  params.toDOM = function(){
    var instances = this.field.model.find({ _id: { $in: this.value }});
    return instances;
  };
  params.fromDOM = function( value ){
    if ( _.isEmpty( value ) ){
      return [];
    }
    return value;
  };

  params.defaultValue = params.defaultValue || [];

  ModelChoiceField.call( this, params );

  Object.defineProperty( this, "pattern", {
    value: function(){
      var c = _.reduce( this.choices(), function( memo, value ){
        memo.push( value._id );
        return memo;
      }, [] );
      return this._optional( Formation.Validators.ChoicesArray( c, this.min, this.max ) );
    }
  });

  Object.defineProperty( this, "instance", {
    value: Formation.FieldInstance({ field: this })
  });
};

Formation.Fields.ModelMultipleChoice.prototype = Object.create( ModelChoiceField.prototype );
