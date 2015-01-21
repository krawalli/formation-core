/**
* @module Formation
* @submodule ModelInstance
*/

ModelInstanceSuper = function( params ){


  /**
  * Model Super Class; not usually used by end dev
  * @class ModelSuper
  * @constructor
  * @param {Object} data      Data to create ModelInstance with
  */
  function ModelInstance( data ){
    this._errors = new ReactiveVar( [] );
    this.setValue( data );
    // if new instance, make sure all fields are in edit mode
    if ( this.isNew() ) this.editMode();

  }


  Object.defineProperties( ModelInstance.prototype, {
    __name__: { value: params.__name__ },

    /**
    * Model that instance was instantiated from
    * @property _model
    * @type Model
    */
    _model: { value: params.model },

    /**
    * Passed in summary of model
    * @method summary
    * @return String
    */
    summary: { value: params.model.summary },

    /**
    * Passed in beforeSave hook of model
    * @method beforeSave
    */
    beforeSave: { value: params.model.hooks.beforeSave },

    /**
    * Passed in afterSave hook of model
    * @method afterSave
    */
    afterSave: { value: params.model.hooks.afterSave },

    /**
    * Passed in beforeValidation hook of model
    * @method beforeValidation
    */
    beforeValidation: { value: params.model.hooks.beforeValidation },

    /**
    * Passed in afterValidation hook of model
    * @method afterValidation
    */
    afterValidation: { value: params.model.hooks.afterValidation },

    /**
    * Passed in modelValidator hook of model
    * @method modelValidator
    * @return Match.Where
    */
    modelValidator: { value: params.model.hooks.modelValidator },

    /**
    * Check to see if model is editable by user; client-side only
    * @method editable
    * @return Boolen
    */
    editable: { value: params.model.editable },

    /**
    * Check to see if model is editable by user; client-side only
    * @method editable
    * @return Boolen
    */
    savable: { value: params.model.savable },

    /**
    * If model is editable by user, toggle editMode
    * @method editMode
    * @param {Boolean} boo [optional]
    * @return Boolean
    */
    editMode:  { value: function editMode( boo ){
        if ( this.editable() ){
          var fields = this.fields();
          typeof boo === "boolean" ? this._editMode.set( boo ) : this._editMode.set( ! this._editMode.get() );

          for ( var field in fields ){
            if ( this._model[ field ] instanceof Array && fields[ field ] instanceof Array ){
              for( var i=0; i < fields[ field ].length; i++ ){
                fields[ field ][ i ].editMode( this.inEditMode() );
              }
            } else {
              fields[ field ].editMode( this.inEditMode() );
            }
          }
        }
        return this.inEditMode();
      }
    },

    /**
    * Returns current state of editMode
    * @method inEditMode
    * @return Boolean
    */
    inEditMode:  { value: function inEditMode(){
        return this._editMode.get();
      }
    },


    /**
    * Model-level errors (as opposed to field-level errors)
    * @method errors
    * @return Array
    */
    errors: { value: function errors(){
        return this._errors.get();
      }
    },


    /**
    * All errors, field and model-level
    * @method getAllErrors
    * @return Object
    */
    getAllErrors: { value: function getAllErrors(){
        var self = this;
        var errors;

        var fields = self.fields();
        errors = {};

        for ( var field in fields ){

          if ( self._model[ field ] instanceof Array && self[ field ] instanceof Array ){
            errors[ field ] = [];

            for ( var i=0; i < self[ field ].length; i++ ){
              if ( self[ field ][ i ].hasErrors() ){
                errors[ field ].push( self[ field ][ i ].getAllErrors() );
              }
            }

          } else {
            if ( ( fields[ field ].__name__ === "ModelInstance" || fields[ field ].__name__ === "NewModelInstance" ) && fields[ field ].hasErrors() ){
              errors[ field ] = self[ field ].getAllErrors();
            } else if ( self[ field ].hasErrors() ){
              errors[ field ] = self[ field ].errors();
            }
          }
        }

        return errors;
      }
    },


    /**
    * If model has errors field or model-level, return true; else false
    * @method hasErrors
    * @return Boolean
    */
    hasErrors: { value: function hasErrors(){
        var ob = this.fields();
        var hasErr = false;
        var self = this;

        if ( ! _.isEmpty( this.errors() ) ){
          return true;
        }

        _.each( ob, function( value, key ){
          var errors = self._errors.get() instanceof Array ? self._errors.get() : [];
          if ( errors.length > 0 ) hasErr = true;

          if ( value instanceof Array ){
            _.each( value, function( v, k ){
              if ( v.hasErrors() ) hasErr = true;
            });

          } else {
            if ( value.hasErrors() ) hasErr = true;
          }
        });

        return hasErr;
      }
    },

    /**
    * Return object of fields only, limited to fields present in model
    * @method fields
    * @return Object
    */
    fields: { value: function fields(){
        var fields = {}
        for ( var field in this ){
          if ( _.has( this._model, field ) ){
            fields[ field ] = this[ field ];
          }
        }
        return fields;
      }
    },

    /**
    * Return array of fields
    * @method fieldsArray
    * @return Array
    */
    fieldsArray: { value: function fieldsArray(){
        return _.values( this.fields() );
      }
    },


    /**
    * If instance is NewModelInstance, return true; else false
    * @method isNew
    * @return Boolean
    */
    isNew: { value: function isNew(){
      return this.__name__ === 'NewModelInstance';
    }},


    /**
    * Save to database; returns number of docs changed (either 1 on success or 0 on fail)
    * @method save
    * @return Number
    */
    save: { value: function save( params, callback ){
      if ( this.beforeSave ) this.beforeSave();
      this.validate();

      var data = this.getValue();

      function saveCallback( err, res ){
        if ( err ){
          var errs = this._errors.get();
          errs.push( err );
          this._errors.set( errs )
          throw new Error( "Please check the form for errors" );
        }
        this.setValue( res );
        if ( this.afterSave ) this.afterSave();
        if ( callback ) callback( err, res );
      }

      if ( this.isNew() ){
        if (! this._parent ) delete data._id;
        else _ensureId.call( this );
        var objectId = this._model.collection.insert( data, saveCallback.bind( this ));
      } else {
        var objectId = Meteor.call( "Formation.update", this._id, data, this._model.collection._name, saveCallback.bind( this ));
      }

      this.editMode( false );
      return objectId;
    }},


    /**
    * Return plain JavaScript object with values.  Blank, non-required values and their fields are not included
    * @method getValue
    * @return Object
    */
    getValue: { value: function getValue(){
      var self    = this;
      var data    = {};
      var fields  = self.fields();
      _ensureId.call( this )

      if (! this.savable() && ! this._parent ) return;
      // if (! this.savable() && this._parent ) return { _id: this._id };

      for ( var field in fields ){
        if ( self._model[ field ] instanceof Array && self[ field ] instanceof Array ){
          data[ field ] = [];

          for ( var i=0; i < self[ field ].length; i++ ){
            if (! self[ field ][ i ].isNew() ){
              data[ field ].push( self[ field ][ i ].getValue() );

            } else if ( self[ field ][ i ]._model.required || self[ field ][ i ].getValue() !== undefined ){
              data[ field ].push( self[ field ][ i ].getValue() );
            }
          }

        } else {
          data[ field ] = fields[ field ].getValue();
        }
      }

      for ( var field in data ){
        if ( ( data[ field ] === undefined || data[ field ] === null ) && fields[ field ].required ){
          delete data[ field ];
        }
      }


      if (! this._model.required && _.isEmpty( _.compact( _.values( data ) ) ) && this.isNew() ){
        return;
      }

      if ( this._parent && this._id ) data._id = this._id;

      return data;
    }},


    /**
    * Set instance data with plain JavaScript object.
    * @method setValue
    * @param {Object} data
    * @return ModelInstance
    */
    setValue: { value: function setValue( data ){
      var schema = this._model;
      if (! data ) return this;

      // iterate through fields and add data
      for ( var field in schema ){
        if ( schema[ field ] instanceof Array ){
          data[ field ] = data[ field ] || [];
          this[ field ] = [];

          for ( var i=0; i < data[ field ].length; i++ ){
            if ( this.isNew() ){
              this[ field ][ i ] = new schema[ field ][ 0 ].newInstance( data[ field ][ i ] );
            } else {
              this[ field ][ i ] = new schema[ field ][ 0 ].instance( data[ field ][ i ] );
            }
            if (! this[ field ][ i ]._parent )
              Object.defineProperty( this[ field ][ i ], "_parent", { value: this });
            if (! this[ field ][ i ]._id )
              Object.defineProperty( this[ field ][ i ], "_id", { value: data[ field ][ i ]._id || ( new Mongo.ObjectID ).toJSONValue() } )
          }

          if ( _.isEmpty( this[ field ] ) && ! Meteor.isServer ){
            for ( var i=0; i < schema[ field ][ 0 ].extra; i++ ){
              this[ field ].push( new schema[ field ][ 0 ].newInstance );
              Object.defineProperty( this[ field ][ i ], "_parent", { value: this });
              Object.defineProperty( this[ field ][ i ], "_id", { value: ( new Mongo.ObjectID ).toJSONValue() } )
            }
          }
        } else {
          if ( this[ field ] ){
            this[ field ].setValue( data[ field ] ) || this[ field ].getValue();
          } else {
            this[ field ] = new schema[ field ].instance( data[ field ] );
            this[ field ]._editMode.set( this.isNew() );
            Object.defineProperty( this[ field ], "_parent", { value: this });
          }
        }
      }

      return this;
    }},


    /**
    * Validate instance; returns undefined on success; throws errors on failure
    * @method validate
    * @param {function} callback
    */
    validate: { value: function( callback ){
        this._errors.set( [] );

        if ( this.beforeValidation ) this.beforeValidation();
        _ensureId.call( this );

        var fields = this.fields();
        for ( var field in fields ){
          if ( this._model[ field ] instanceof Array && this[ field ] instanceof Array ){
            for ( var i=0; i < this[ field ].length; i++ ){
              _ensureParent.call( this, this[ field ][ i ] );
              this[ field ][ i ].validate();
            }
          } else {
            fields[ field ].validate();
            if ( this._model && fields[ field ].field ){
              if ( fields[ field ].field.unique && this._model.collection ){
                var find = {};
                find[ field ] = fields[ field ].value;
                find._id = { '$ne': this._id };

                if ( this._model.collection.find( find ).count() !== 0 ){
                  var errs = fields[ field ]._errors.get();
                  errs.push( new Error( "This " + field + " already exists." ) );
                  this._errors.set( errs );
                }
              }
            }
          }
        }

        if ( this.modelValidator ){
          try {
            check( this.getValue(), this.modelValidator() );
          } catch( e ){
            var errs = this._errors.get();
            errs.push( e );
            this._errors.set( errs );
          }
        }

        // Remove errors of unrequired fields
        if ( this.hasErrors() && this.isNew() ){
          if ( ! this._model.required ){

            var fields = this.fields();
            for ( var field in fields ){
              if ( ! this[ field ].field.required ){
                switch( typeof( this[ field ].value ) ){
                  case 'undefined':
                    this[ field ]._errors = [];
                    break;
                  case 'string':
                  case 'array':
                    if ( this[ field ].value.length === 0 ){
                      this[ field ].value = this[ field ].field.defaultValue();
                      this[ field ]._errors = [];
                    }
                    break;
                }
              }
            }
            this._errors.set( [] );
          }
        };

        if ( this.hasErrors() ){
          console.log( this.getAllErrors() );
          throw new Error( 'Please check the fields for errors.' );
        }

        if ( this.afterValidation ) this.afterValidation();
        if ( typeof( callback ) === "function" ) callback();

      }
    }

  });

  // add virtual fields to prototype
  for ( var field in params.model.virtualFields ){
    if ( typeof( params.model.virtualFields[ field ] ) === 'function' ){
      Object.defineProperty( ModelInstance.prototype, field, { value: params.model.virtualFields[ field ] } );
    } else {
      throw new Error( "All virtual fields must be functions." );
    }
  }

  // if ( Meteor.isServer ){
    /**
    * Return plain JavaScript object with values.  Blank, non-required values and their fields are not included
    * @method getValue
    * @return Object
    */
    Object.defineProperty( ModelInstance.prototype, "getUnsavableValues", { value: function getUnsavableValues(){
      var self    = this;
      var data    = {};
      var fields  = self.fields();
      if (! this.savable() ) return this.getValue();

      for ( var field in fields ){
        if ( self._model[ field ] instanceof Array && self[ field ] instanceof Array ){
          data[ field ] = [];

          for ( var i=0; i < self[ field ].length; i++ ){
            data[ field ].push( self[ field ][ i ].getUnsavableValues() );
          }

        } else {
          var val = fields[ field ].getUnsavableValues();
          if ( val ) data[ field ] = val;
        }
      }

      if ( this._parent && this._id ) data._id = this._id;
      return data;
    }})
  // }

  return ModelInstance;

};



function _ensureId(){
  if (! this._id && this._parent )
    Object.defineProperty( this, "_id", { value: ( new Mongo.ObjectID ).toJSONValue() })
}

function _ensureParent( field ){
  if (! field._parent )
    Object.defineProperty( field, "_parent", { value: this })
}
