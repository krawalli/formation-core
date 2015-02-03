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
    var attrCopy = _.clone( this._model.attributes );
    var attr = new ReactiveVar( attrCopy );

    function setAttributes( attributes ){
      var attributes        = attributes || {};
      var oldAttributes     = _.clone( this._model.attributes );

      if      ( typeof( attributes.bootstrap )  === "boolean" ) attributes.bootstrap = attributes.bootstrap;
      else if ( typeof( oldAttributes.bootstrap ) === "boolean" ) attributes.bootstrap = oldAttributes.bootstrap;
      else attributes.bootstrap = true;

      attributes.class      = attributes.class || oldAttributes.class || '';
      attributes.class      = attributes.class.replace( /form-control/ig, '' ).trim();
      if ( attributes.bootstrap ) attributes.class += " form-control";
      attributes.class = attributes.class.trim();

      if      ( typeof( attributes.horizontal )  === "boolean" ) attributes.horizontal = attributes.horizontal;
      else if ( typeof( oldAttributes.horizontal ) === "boolean" ) attributes.horizontal = oldAttributes.horizontal;
      else attributes.horizontal = true;

      var schema = this._model;
      if (! data ) return this;

      // iterate through fields and add data
      for ( var field in schema ){
        if ( schema[ field ] instanceof Array ){
          var model     = schema[ field ][ 0 ];
          data[ field ] = data[ field ] || [];
          this[ field ] = [];

          for ( var i=0; i < data[ field ].length; i++ ){
            if ( this.isNew() )
              this[ field ][ i ] = new model.newInstance( data[ field ][ i ] );
            else
              this[ field ][ i ] = new model.instance( data[ field ][ i ] );

            if (! this[ field ][ i ]._parent )
              Object.defineProperty( this[ field ][ i ], "_parent", { value: this });
            if (! this[ field ][ i ]._id )
              Object.defineProperty( this[ field ][ i ], "_id", { value: data[ field ][ i ]._id || ( new Mongo.ObjectID ).toJSONValue() } )

            this[ field ][ i ].setAttributes( attributes );
          }
        } else {
          this[ field ] = new schema[ field ].instance( data[ field ] );
          this[ field ]._editMode.set( this.isNew() );
          Object.defineProperty( this[ field ], "_parent", { value: this });
          this[ field ].setAttributes( attributes );
        }
      }

      attr.set( attributes );
      return this;
    }
    function getAttributes(){
      return attr.get();
    }

    Object.defineProperties( this, {
      _errors:        { value: new ReactiveVar( [] ), writable: true, enumerable: false },
      attributes:     { value: getAttributes },
      setAttributes:  { value: setAttributes },
    });

    // if new instance, make sure all fields are in edit mode
    if ( this.isNew() ) this.editMode();
    this.setAttributes();
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
    * @return Boolean
    */
    editable: { value: params.model.editable },

    /**
    * Check to see if model is editable by user
    * @method savable
    * @return Boolean
    */
    savable: { value: params.model.savable },

    /**
    * Check to see if model (in array) is removable by user
    * @method removable
    * @return Boolean
    */
    removable: { value: params.model.removable },

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
    save: { value: function save( callback ){
      if ( this.beforeSave ) this.beforeSave();
      this.validate();

      var data = this.getValue();

      function saveCallback( err, res ){
        if ( err ){
          var errs = this._errors.get();
          errs.push( err );
          this._errors.set( errs );
          console.log( err.message );
          return;
        }
        this.setValue( res );
        if ( this.afterSave ) this.afterSave();
        if ( typeof( callback ) === "function" ) callback( err, res );
      }

      if ( this.isNew() ){
        if (! this._parent ) delete data._id;
        else _ensureId.call( this );
        var objectId = Meteor.call( "Formation.insert", data, this._model.collection._name, saveCallback.bind( this ));
      } else {
        var objectId = Meteor.call( "Formation.update", this._id, data, this._model.collection._name, saveCallback.bind( this ));
      }

      this.editMode( false );
      return objectId;
    }},


    /**
    * Determines if model has any retrievable value
    * @method isEmpty
    * @return Boolean
    */
    isEmpty: { value: function isEmpty(){
      return _.chain( this.getValue() ).values().compact().isEmpty().value();
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

      if (! this.savable() && ! this._parent ) return data;

      for ( var field in fields ){
        if ( self._model[ field ] instanceof Array && self[ field ] instanceof Array ){
          data[ field ] = [];

          for ( var i=0; i < self[ field ].length; i++ ){
            if (! self[ field ][ i ].isNew() ){
              data[ field ].push( self[ field ][ i ].getValue() );

            } else if ( self[ field ][ i ]._model.required || ! self[ field ][ i ].isEmpty() ){
              data[ field ].push( self[ field ][ i ].getValue() );
            }
          }

        } else {
          data[ field ] = fields[ field ].getValue();
        }
      }

      if (! this._model.required && _.chain( data ).values().compact().isEmpty().value() && this.isNew() )
        return;


      if ( this._parent && this._id ) data._id = this._id;

      return data;
    }},


    /**
    * Set instance data with plain JavaScript object.
    * @method setValue
    * @param {Object} data
    * @return ModelInstance
    */
    setValue: { value: function setValue( patch ){
      var model = this._model;
      if (! patch ) return;
      if (! patch.__name__ ) patch = new model.instance( patch );

      for ( field in model ){
        var doc       = this[ field ];
        var patchDoc  = patch[ field ];

        if ( model[ field ] instanceof Array ){
          patchDoc = patchDoc || [];
          if (! doc ) doc = patchDoc;
          var newDocs = [];

          // iterate over items from new doc;
          // find any items new to doc
          patchDoc.forEach( function( item, index, array ){
            var oldItem = _.find( doc, function( i ){ return i._id === item._id });
            if (! oldItem ){
              var newItem = new model[ field ][ 0 ].newInstance( item.getValue() );
              if (! newItem._parent ) Object.defineProperty( newItem, "_parent", { value: this });
              if (! newItem._id )     Object.defineProperty( newItem, "_id", { value: ( new Mongo.ObjectID ).toJSONValue() } )
              if ( item.savable() )   newDocs.push( item );

            } else if ( oldItem ){
              newDocs.push( oldItem.setValue( item ) );
            }
          })

          // iterate over old items;
          // find old items that have been removed from old doc;
          // remove if permissible; else add/retain item;
          doc.forEach( function( item, index, array ){
            var newItem = _.find( newDocs, function( i ){ return i._id === item._id });
            if (( ! item.savable() || ! item.removable() ) && ! newItem )
              newDocs.push( item );
          })

          if ( _.isEmpty( newDocs ) && ! Meteor.isServer ){
            for ( var i=0; i < model[ field ][ 0 ].extra; i++ ){
              this[ field ].push( new model[ field ][ 0 ].newInstance );
              Object.defineProperty( this[ field ][ i ], "_parent", { value: this });
              Object.defineProperty( this[ field ][ i ], "_id", { value: ( new Mongo.ObjectID ).toJSONValue() } )
            }
          }

          this[ field ] = newDocs;

        } else if ( model[ field ].__name__ === "Model" || model[ field ].__name__ === "Field" ){
          var nVal = patchDoc.getValue();
          if ( doc.savable() && nVal !== undefined )
            doc.setValue( nVal );
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
