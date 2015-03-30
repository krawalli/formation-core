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
    var attrCopy  = _.clone( this._model.attributes );
    var schema    = this._model;
    var data      = data || {};

    _traverseModel.call( this, initArray, initFieldOrModel, initFieldOrModel, data );

    Object.defineProperties( this, {
      _attr:          { value: new ReactiveVar( attrCopy ) },
      _errors:        { value: new ReactiveVar( [] ), writable: true, enumerable: false },
      attributes:     { value: getAttributes.bind( this ) },
      setAttributes:  { value: setAttributes.bind( this ) },
    });

    if ( this.isNew() ) this.editMode();
  }

  var save;
  if (! params.model.collection && typeof( params.model.save ) === 'function' )
    save = params.model.save;
  else
    save = saveInstance;

  var savable = params.model.savable;
  if ( savable === null ){
    savable = function(){
      if (! this._model.collection ) return true;

      if ( this.isNew() ){
        var insertValidators  = this._model.collection._validators.insert.allow;
        var insertDeny        = this._model.collection._validators.insert.deny;
        if ( insertValidators.length === 0 && Meteor.isServer ) return false;
        if ( insertValidators.length === 0 && Meteor.isClient ) return true;

        var fal = _.all( insertValidators, function( val ){
          var data    = {};
          _traverseModel.call( this, getArrayData, getModelData, getModelData, data );
          return ! val( Meteor.userId(), data );
        }.bind( this ));

        if ( fal ) return false;

        fal = _.any( insertDeny, function( val ){
          var data    = {};
          _traverseModel.call( this, getArrayData, getModelData, getModelData, data );
          return val( Meteor.userId(), data );
        }.bind( this ));

        if ( fal ) return false;

      } else {
        var updateValidators  = this._model.collection._validators.update.allow;
        var updateDeny        = this._model.collection._validators.update.deny;

        if ( updateValidators.length === 0 && Meteor.isServer ) return false;
        if ( updateValidators.length === 0 && Meteor.isClient ) return true;

        var fal = _.all( updateValidators, function( val ){
          var data    = {};
          _traverseModel.call( this, getArrayData, getModelData, getModelData, data );
          return ! val( Meteor.userId(), this._id, _.keys( this.fields() ), data );
        }.bind( this ));

        if ( fal ) return false;

        fal = _.any( updateDeny, function( val ){
          var data    = {};
          _traverseModel.call( this, getArrayData, getModelData, getModelData, data );
          return val( Meteor.userId(), this._id, _.keys( this.fields() ), data );
        }.bind( this ));

        if ( fal ) return false;
      }

      return true;
    }
  }


  var removable = params.model.removable;
  if ( removable === null ){
    removable = function(){
      if (! this._model.collection ) return true;
      if ( this.isNew() ){
        return true;
      } else {
        var removeValidators  = this._model.collection._validators.remove.allow;
        var removeDeny        = this._model.collection._validators.remove.deny;
        if ( removeValidators.length === 0 && Meteor.isServer ) return false;
        if ( removeValidators.length === 0 && Meteor.isClient ) return true;

        var fal = _.all( removeValidators, function( val ){
          return ! val( Meteor.userId(), this._id );
        }.bind( this ));
        if ( fal ) return false;

        fal = _.any( removeDeny, function( val ){
          return val( Meteor.userId(), this._id );
        }.bind( this ));
        if ( fal ) return false;
      }

      return true;
    }
  }

  var editable = params.model.editable;
  if ( editable === null ) editable = savable;

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
    editable: { value: editable },

    /**
    * Check to see if model is savable by user
    * @method savable
    * @return Boolean
    */
    savable: { value: savable },

    /**
    * Check to see if model (in array) is removable by user
    * @method removable
    * @return Boolean
    */
    removable: { value: removable },

    /**
    * If model is editable by user, toggle editMode
    * @method editMode
    * @param {Boolean} boo [optional]
    * @return Boolean
    */
    editMode:  { value: function editMode( boo ){
      if ( this.editable() ){
        typeof boo === "boolean" ? this._editMode.set( boo ) : this._editMode.set(! this._editMode.get() );

        _traverseModel.call( this, editModeArray, editModeModel, editModeModel )
      }
      return this.inEditMode();
    }},

    /**
    * Returns current state of editMode
    * @method inEditMode
    * @return Boolean
    */
    inEditMode:  { value: function inEditMode(){
      return this._editMode.get();
    }},

    /**
    * Model-level errors (as opposed to field-level errors)
    * @method errors
    * @return Array
    */
    errors: { value: function errors(){
      return this._errors.get();
    }},

    /**
    * All errors, field and model-level
    * @method getAllErrors
    * @return Object
    */
    getAllErrors: { value: function getAllErrors(){
      var errors  = {};
      errors = _traverseModel.call( this, setArrayErrors, setModelErrors, setFieldErrors, errors );
      return errors;
    }},

    /**
    * If model has errors field or model-level, return true; else false
    * @method hasErrors
    * @return Boolean
    */
    hasErrors: { value: function hasErrors(){
      return ! _.isEmpty( this.getAllErrors() );
    }},

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
    }},

    /**
    * Return array of fields
    * @method fieldsArray
    * @return Array
    */
    fieldsArray: { value: function fieldsArray(){
      return _.values( this.fields() );
    }},

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
    save: { value: save },

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
      var data    = {};
      if (! this.savable() && ! this._parent ) return data;
      _traverseModel.call( this, getArrayData, getModelData, getModelData, data );

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
      if (! patch ) return;
      if (! patch.__name__ ) patch = new this._model.instance( patch );

      _traverseModel.call( this, setArrayValue, setModelValue, setModelValue, patch );
      return this;
    }},

    /**
    * Validate instance; returns undefined on success; throws errors on failure
    * @method validate
    * @param {function} callback
    */
    validate: { value: function validate( callback ){
      this._errors.set( [] );
      if ( this.beforeValidation ) this.beforeValidation();
      _ensureId.call( this );
      _traverseModel.call( this, validateArray, validateModel, validateModel );

      if ( this.modelValidator ){
        try {
          check( this.getValue(), this.modelValidator() );
        } catch( e ){
          var errs = this._errors.get();
          errs.push( e );
          this._errors.set( errs );
        }
      }

      if ( this.hasErrors() ){
        console.log( this.getAllErrors() );
        throw new Error( 'Please check the fields for errors.' );
      }

      if ( this.afterValidation ) this.afterValidation();
      if ( typeof( callback ) === "function" ) callback();
    }},

    /**
    * Revert to previously saved value
    * @method revert
    */
    revert: { value: function revert(){
      if (! this._model.collection || ! this._id || this.isNew() ) return;
      var revertTo = this._model.collection.findOne( this._id );
      this.setValue( revertTo );
    }}

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



/////////////////////////////////////
///  Private  //////////
/////////////////////////////////////

function _ensureId( dataId ){
  var dataId  = dataId || null;
  var newId   = typeof( dataId ) === 'string' ? dataId : ( new Mongo.ObjectID ).toJSONValue();
  if (! this._id && this._parent )
    Object.defineProperty( this, "_id", { value: newId })
}


function _ensureParent( field ){
  if (! field._parent )
    Object.defineProperty( field, "_parent", { value: this })
}


function _traverseModel( withArray, withModel, withField, data ){
  var schema    = this._model;

  for ( var f in schema ){
    var field = schema[ f ];

    if ( field instanceof Array ){
      // withArray ( item, fieldName, context )
      if ( typeof( withArray ) === "function" ) withArray.call( this, field[0], f, data );

    } else if ( field.__name__ === "Model" ) {
      // withModel
      if ( typeof( withModel ) === "function" ) withModel.call( this, field, f, data );

    } else if ( field.__name__ === "Field" ){
      // withField
      if ( typeof( withField ) === "function" ) withField.call( this, field, f, data );

    }
  }

  return data;
}


function initArray( item, fieldName, adata ){
  this[ fieldName ]       = [];
  if (! adata ||
      ! adata[ fieldName ] ||
      ! adata[ fieldName ] instanceof Array )
      return;

  for ( var i=0; i < adata[ fieldName ].length; i++ ){
    var arrayData = adata[ fieldName ][ i ] || {};

    if ( this.isNew() )
      this[ fieldName ][ i ] = new item.newInstance( arrayData );
    else
      this[ fieldName ][ i ] = new item.instance( arrayData );

    _ensureParent.call( this, this[ fieldName ][ i ] );
    _ensureId.call( this[ fieldName ][ i ], arrayData._id );
    this[ fieldName ][ i ].setAttributes();
  }
}


function initFieldOrModel( item, fieldName, data ){
  var fieldData     = data[ fieldName ];
  this[ fieldName ] = new item.instance( fieldData );
  this[ fieldName ]._editMode.set( this.isNew() );
  _ensureParent.call( this, this[ fieldName ] );
  this[ fieldName ].setAttributes();
}


function setAttributes( attributes ){
  var attributes        = attributes || {};
  var oldAttributes     = _.clone( this._model.attributes );
  var schema            = this._model;

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

  function setArrayAttributes( item, fieldName, data ){
    for ( var i=0; i < this[ fieldName ].length; i++ ){
      this[ fieldName ][ i ].setAttributes( data );
    }
  }
  function setModelAttributes( item, fieldName, data ){
    this[ fieldName ].setAttributes( data )
  }

  _traverseModel.call( this, setArrayAttributes, setModelAttributes, setModelAttributes, attributes )

  this._attr.set( attributes );
  return this;
}


function getAttributes(){
  return this._attr.get();
}


function editModeArray( item, fieldName, data ){
  for( var i=0; i < this[ fieldName ].length; i++ ){
    this[ fieldName ][ i ].editMode( this.inEditMode() );
  }
}


function editModeModel( item, fieldName, data ){
  this[ fieldName ].editMode( this.inEditMode() );
}


function setArrayErrors( item, fieldName, data ){
  data[ fieldName ] = [];
  for ( var i=0; i < this[ fieldName ].length; i++ ){
    if ( this[ fieldName ][ i ].hasErrors() ){
      data[ fieldName ].push( this[ fieldName ][ i ].getAllErrors() );
    }
  }
  if ( data[ fieldName ].length <= 0 ) delete data[ fieldName ];
}


function setModelErrors( item, fieldName, data ){
  if ( this[ fieldName ].hasErrors() ) data[ fieldName ] = this[ fieldName ].getAllErrors();
}


function setFieldErrors( item, fieldName, data ){
  if ( this[ fieldName ].hasErrors() ) data[ fieldName ] = this[ fieldName ].errors();
}


function getArrayData( item, fieldName, data ){
  if (! this[ fieldName ] instanceof Array ) return [];
  data[ fieldName ] = [];

  for ( var i=0; i < this[ fieldName ].length; i++ ){
    if (! this[ fieldName ][ i ].isNew() ){
      data[ fieldName ].push( this[ fieldName ][ i ].getValue() );

    } else if ( item.required || ! this[ fieldName ][ i ].isEmpty() ){
      data[ fieldName ].push( this[ fieldName ][ i ].getValue() );
    }
  }
  return data;
}


function getModelData( item, fieldName, data ){
  data[ fieldName ] = this[ fieldName ].getValue();
  return data;
}


function setArrayValue( modelField, fieldName, patch ){
  var doc     = this[ fieldName ];
  var newDocs = [];
  patchDoc    = patch[ fieldName ] || [];
  if (! doc ) doc = patchDoc;

  // iterate over items from new doc;
  // find any items new to doc
  patchDoc.forEach( function( item, index, array ){
    var oldItem = _.find( doc, function( i ){ return i._id === item._id });
    if (! oldItem ){
      var newItem = new modelField.newInstance( item.getValue() );
      if ( newItem.savable() ) newDocs.push( newItem );
      _ensureParent.call( this, newItem );
      _ensureId.call( newItem, patch[ fieldName ][ index ]._id );

    } else if ( oldItem ){
      oldItem.setValue( item )
      newDocs.push( oldItem );
    }
  }.bind( this ))

  // iterate over old items;
  // find old items that have been removed from old doc;
  // remove if permissible; else add/retain item;
  doc.forEach( function( item, index, array ){
    var newItem = _.find( newDocs, function( i ){ return i._id === item._id });
    if (( ! item.savable() || ! item.removable() ) && ! newItem ){
      newDocs.push( item );
    }

  }.bind( this ))

  if ( _.isEmpty( newDocs ) && ! Meteor.isServer ){
    for ( var i=0; i < modelField.extra; i++ ){
      this[ fieldName ].push( new modelField.newInstance );
      _ensureParent.call( this, this[ fieldName ][ i ] );
      _ensureId.call( this[ fieldName ][ i ] );
    }
  }

  this[ fieldName ] = newDocs;
}


function setModelValue( modelField, fieldName, patch ){
  var doc       = this[ fieldName ];
  var patchDoc  = patch[ fieldName ];
  if ( doc.savable() && patchDoc.getValue() !== undefined )
    doc.setValue( patchDoc.getValue() );
}


function validateArray( item, fieldName ){
  if ( this[ fieldName ] instanceof Array ){
    for ( var i=0; i < this[ fieldName ].length; i++ ){
      _ensureParent.call( this, this[ fieldName ][ i ] );
      this[ fieldName ][ i ].validate();
    }
  }
}


function validateModel( item, fieldName ){
  if (this[ fieldName ].validate !== undefined) {
    this[ fieldName ].validate();
  } else {
    throw new Error( "Field '" + fieldName + "' should be a Formation Model, but its not!" );
  }

  if ( item.unique && this._model.collection ){
    var find = {};
    find[ field ] = this[ fieldName ].value;
    find._id = { '$ne': this._id };

    // check uniqueness; add error to model if not unique
    if ( this._model.collection.find( find ).count() !== 0 ){
      var errs = this[ fieldName ]._errors.get();
      errs.push( new Error( "This " + field + " already exists." ) );
      this._errors.set( errs );
    }
  }
}


function saveInstance( callback ){
  this.validate();
  if ( this.beforeSave ) this.beforeSave();

  var data = this.getValue();
  var objectId;
  function saveCallback( err, res ){
    if ( err ){
      var errs = this._errors.get();
      errs.push( err );
      this._errors.set( errs );
      console.log( err.message );
      return;
    }
    objectId = res;
    if (! this.isNew() )  this.setValue( res );
    //FIXME: afterSave is also triggered from saving.js #65
    //if ( this.afterSave ) this.afterSave();
    if ( typeof( callback ) === "function" ) callback( err, res );
  }

  if ( this.isNew() ){
    if (! this._parent ) delete data._id;
    else _ensureId.call( this );
    Meteor.call( "Formation.insert", data, this._model.collection._name, saveCallback.bind( this ));
  } else {
    Meteor.call( "Formation.update", this._id, data, this._model.collection._name, saveCallback.bind( this ));
  }

  this.editMode( false );
  return objectId;
}
