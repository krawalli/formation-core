/**
* Generate Forms from JS; for Meteor
* @module Formation
*/

var err = function( message ){
  throw new Error( message );
};


/**
* @module Formation
* @submodule Model
*/

Formation.Model = function( params ){
  var self = this;
  if ( typeof params === "function" ) params = new params;

  _.each( params.schema, function( field, key ){
    if (! field.label && field instanceof Formation.Field ){
      Object.defineProperty( field, "label", { value: Formation.camelToTitleCase( key ) } );
    }
  });


  // assemble query filter
  var filter;
  switch ( typeof( params.filter ) ){
  case 'undefined':
    filter = function(){ return {}; };
    break;
  case 'object':
    filter = function(){ return params.filter; };
    break;
  case 'function':
    filter = params.filter;
    break;
  }

  var editable;
  switch ( typeof( params.editable ) ){
    case Meteor.isServer:
      editable = function(){ return true };
      break;
    case "boolean":
      var boo = params.editable
      editable = function(){ return boo };
      break;
    case "function":
      editable = params.editable;
      break;
    default:
      editable = null;
      break;
  }

  var savable;
  switch ( typeof( params.savable ) ){
    case "boolean":
      var boo = params.savable
      savable = function(){ return boo };
      break;
    case "function":
      savable = params.savable;
      break;
    default:
      savable = null;
      break;
  }

  var removable;
  switch ( typeof( params.removable ) ){
    case "boolean":
      var boo = params.removable;
      removable = function(){ return boo };
      break;
    case "function":
      removable = params.removable;
      break;
    default:
      removable = null;
      break;
  }

  var hooks = {};
  hooks.beforeSave        = typeof( params.beforeSave )       === 'function' || typeof( params.beforeSave )       === 'undefined' ? params.beforeSave       : err( "beforeSave hook must be a function" );
  hooks.afterSave         = typeof( params.afterSave )        === 'function' || typeof( params.afterSave )        === 'undefined' ? params.afterSave        : err( "afterSave hook must be a function" );
  hooks.beforeValidation  = typeof( params.beforeValidation ) === 'function' || typeof( params.beforeValidation ) === 'undefined' ? params.beforeValidation : err( "beforeValidation hook must be a function" );
  hooks.afterValidation   = typeof( params.afterValidation )  === 'function' || typeof( params.afterValidation )  === 'undefined' ? params.afterValidation  : err( "afterValidation hook must be a function" );
  hooks.modelValidator    = typeof( params.modelValidator )   === 'function' || typeof( params.modelValidator )   === 'undefined' ? params.modelValidator   : err( "modelValidator hook must be a function" );

  var attributes        = params.attributes || {};

  function setAttributes( attrs ){
    if ( typeof( attrs.bootstrap )  === "boolean" ) attributes.bootstrap = attrs.bootstrap;
    else attributes.bootstrap = typeof( attributes.bootstrap ) === "boolean" ? attributes.bootstrap : true;

    attributes.class  = attrs.class  || attributes.class  || '';
    attributes.class  = attributes.class.replace( /form-control/ig, '' ).trim();
    if ( attributes.bootstrap ) attributes.class += ' form-control';
    attributes.class = attributes.class.trim();

    if      ( typeof( attrs.horizontal ) === "boolean" )        attributes.horizontal = attrs.horizontal;
    else if ( typeof( attributes.horizontal ) === "boolean" )   attributes.horizontal = attributes.horizontal;
    else attributes.horizontal = true;

    return this;
  }

  setAttributes( attributes );

  function getAttributes(){
    return attributes;
  }

  /**
  * Make a Model for a form/DB document to adhere to and validate against
  * @class Model
  * @constructor
  * @param {Object} params  { <br />
                              <b>collection</b>: Mongo.Collection,<br />
                              <b>schema</b>: Object, determines data structure for your model, and is generally made up of Fields,<br />
                              <b>virtualFields</b>: { functions } [optional],  object of "name: functions" to include in ModelInstances that manipulate data of actual fields and return something;<br />
                              <b>beforeValidation</b>: function [optional],  function to run before ModelInstance validates,<br />
                              <b>afterValidation</b>: function [optional],  function to run after ModelInstance validates,<br />
                              <b>beforeSave</b>: function [optional],  function to run before ModelInstance saves,<br />
                              <b>afterSave</b>: function [optional],  function to run after ModelInstance saves,<br />
                              <b>modelValidator</b>: function [optional],  function to run after each field validates, before saving; returns a pattern (i.e. Match.Where);  used to run extra validation functions on model as a whole<br />
                              <b>filter</b>:  Object/Function [optional],  object/function to add to filter passed into Model.find() or Model.findOne()<br />
                            }
  */
  function Model(){}

  Object.defineProperties( Model.prototype, {
    __name__: { value: 'Model' },


    /**
    * Mongo.Collection object
    * @property collection
    * @type Mongo.Collection
    */
    collection: { value: params.collection instanceof Meteor.Collection || typeof( params.collection ) === 'undefined' ? params.collection : err( "Please enter a Meteor Collection for instances of Formation.Model" ) },


    /**
    * If model is array, number of extra new instances to create
    * @property extra
    * @type Number
    */
    extra: { value: typeof( params.extra ) === "number" ? params.extra : 1 },


    /**
    * If model is array, is it required?
    * @property required
    * @type Boolean
    */
    required: { value: typeof( params.required ) === "boolean" ? params.required : true },


    /**
    * Developer-set function to determine if model is editable by user;  client-side only.
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @method editable
    * @type Function
    */
    editable: { value: editable },


    /**
    * Developer-set function to determine if model is savable by user;
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @method savable
    * @type Function
    */
    savable: { value: savable },


    /**
    * Developer-set function to determine if model (in an array) is removable by user;
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @method removable
    * @type Function
    */
    removable: { value: removable },


    /**
    * Object containing beforeSave, afterSave, beforeValidation, afterValidation, and modelValidator hooks.
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @property hooks
    * @type Object
    */
    hooks: { value: hooks },


    /**
    * Object attributes to be distributed down to each field
    * @property attributes
    * @type Object
    */
    attributes: { get: getAttributes },


    /**
    * Object attributes to be distributed down to each field
    * @property attributes
    * @type Object
    */
    setAttributes: { value: setAttributes },


    /**
    * Developer-set function to return a summary string of model instances of this model.
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @method summary
    * @type Function
    */
    summary: { value: typeof( params.summary ) === 'function' ? params.summary : function(){ return 'un-summarized model'; } },
    filter: { value: filter },
    fieldsFilter: { value: function(){
        return _.reduce( _.keys( this ), function( memo, value ){
          memo[ value ] = 1;
          return memo;
        }, {} );
      }
    },


    savableFields: { value: function(){
      return _.reduce( _.keys( this ), function( memo, field ){
        var f;
        if ( this[ field ] instanceof Array ) f = this[ field ][ 0 ];
        else f = this[ field ]

        if ( f.savable() ) memo.push( field );
        return memo;
      }.bind( this ), [] )
    }},


    /**
    * Object of functions (and their names) to manipulate instance data and return it as if it were a real ModelInstance field.
    *  Context of the function you pass in will be a ModelInstance (i.e. use this.<field>.value to access fields values );
    * @property virtualFields
    * @type Object
    */
    virtualFields: { value: ( params.virtualFields instanceof Object ) && ! ( params.virtualFields instanceof Array ) ? params.virtualFields : {} },


    /**
    * Find DB Objects; Same as collection.find().fetch(), but returns ModelInstances instead of plain objects
    * @method find
    * @param {Object} Selector
    * @param {Object} Options
    * @return {Array}           Returns an array of ModelInstances, not a cursor; you can access the raw DB objects by using Model.collecton.find()
    */
    find: { value: function( filter, options ){
        var protoself = this;

        var filter = filter || {};
        _.extend( filter, protoself.filter() );
        var options = options || {};
        _.extend( options, { fields: this.fieldsFilter() } );

        collectionObjects = this.collection.find( filter, options ).fetch();

        for ( var i=0; i < collectionObjects.length; i++ ){
          for ( field in protoself ){
            if ( protoself[ field ] instanceof Array && typeof( collectionObjects[ i ][ field ] ) === "undefined" ){
              collectionObjects[ i ][ field ] = [];
            }
          }
        }

        instances = [];
        for ( collectionObject in collectionObjects ){
          var instance = new protoself.instance( collectionObjects[ collectionObject ] );
          instances.push( instance );
        }

        return instances;
      }
    },


    /**
    * Find One DB Object; Same as collection.findOne(), but returns a ModelInstance instead of a plain object
    * @method findOne
    * @param {Object} Selector
    * @param {Object} Options
    * @return {ModelInstance}     Returns a single ModelInstances or undefined; you can access the raw DB objects by using Model.collecton.findOne()
    */
    findOne: { value: function( filter, options ){
        var protoself = this;

        filter = filter || {};
        _.extend( filter, protoself.filter() );
        options = options || {};
        _.extend( options, { fields: this.fieldsFilter() } );
        var collectionObject = protoself.collection.findOne( filter, options );

        var instance;
        if ( collectionObject ){
          for ( field in protoself ){
            if ( protoself[ field ] instanceof Array && typeof( collectionObject[ field ] ) === "undefined" ){
              collectionObject[ field ] = [];
            }
          }

          instance = new protoself.instance( collectionObject );
        }

        return instance;
      }
    }
  });

  var model = new Model;
  Object.defineProperties( Model.prototype, {

    /**
    * Create a new ModelInstance (i.e. an instance to update, not insert);  must use "new" keyword
    * @method instance
    * @constructor
    * @param {Object} data    data to create ModelInstance with
    */
    instance: { value: Formation.ModelInstance({ model: model }) },

    /**
    * Create a new NewModelInstance (i.e. an instance to insert, not update);  must use "new" keyword
    * @method newInstance
    * @constructor
    * @param {Object} data    data to create NewModelInstance with
    */
    newInstance: { value: Formation.NewModelInstance({ model: model }) }
  });


  var schema = params.schema || err( 'Please add a schema to this model' );
  for ( field in schema ){
    Object.defineProperty( model, field, { value: schema[ field ], enumerable: true });
    if ( model[ field ] instanceof Array )
      model[ field ][ 0 ].setAttributes( model.attributes );
    else
    model[ field ].setAttributes( model.attributes );
  }

  return model;
};
