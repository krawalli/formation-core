/**
* @module Formation
* @submodule Field
*/

err = function( message ){ throw new Error( message ); };

////////////////////////////////////////////////////////////
////  Field Parent
////////////////////////////////////////////////////////////


if ( typeof( Formation.Fields ) === 'undefined' )  Formation.Fields = {};


/**
*	Field Parent Model; all fields inherit from this
* @class Field
* @constructor
* @param {Object} params      {<br />
*                                <b>label</b>:     String [optional]. Label for field,<br />
*                                <b>helpText</b>:  String [optional]. Help text; will often appear as field placeholder,<br />
*                                <b>widget</b>:    String [optional]. Widget name for field; should correspond to a Template[ widget ],<br />
*                                <b>label</b>:     String [optional]. Label for field,<br />
*                                <b>unique</b>:    Boolean [optional]. Ensure value is unique to one ModelInstance / DB document,<br />
*                                <b>min</b>:       Number [optional]. Minimum length / amount of value;  implementation changes based on field data-type,<br />
*                                <b>max</b>:       Number [optional]. Maximum length / amount of value;  implementation changes based on field data-type,<br />
*                                <b>editable</b>:  Function [optional]. Function to determine if user can edit field; runs with FieldInstance context; client-side only,<br />
*                                <b>required</b>:  Boolean [optional]. Is this field required?,<br />
*                                <b>defaultValue</b>:  Number/String/Function [optional]. Default value / function to return default value for FieldInstance,<br />
*                                <b>toDOM</b>:     Function [optional]. Function to transform data in preparation for DOM display,<br />
*                                <b>fromDOM</b>:   Function [optional]. Function to transform data in preparation for DB,<br />
*                                <b>attributes</b>:  Object containing attributes to appear in input
*                              }
*/

Formation.Field = function Field( params ){
  var fromDOMDefault = function( value ){
    if (! value && ! this.required ) return undefined;
    return value;
  };
  var toDOMDefault = function(){
    var protoself = this;
    return protoself.getValue();
  };
  var fromDOM = params.fromDOM  || fromDOMDefault;
  var toDOM   = params.toDOM    || toDOMDefault;

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
      editable = function(){ return true };
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
      savable = function(){ return true };
      break;
  }

  var attributes        = params.attributes || {};

  function setAttributes( attrs ){
    var attrs             = attrs || {};
    if ( typeof( attrs.bootstrap ) === 'boolean' ) attributes.bootstrap = attrs.bootstrap;
    else attributes.bootstrap = typeof( attributes.bootstrap ) === 'boolean' ? attributes.bootstrap : true

    attributes.id     = attrs.id    ||  attributes.id     || '';
    attributes.class  = attrs.class ||  attributes.class  || '';

    attributes.class      = attributes.class.replace( /form-control/ig, '' ).trim();
    if ( attributes.bootstrap ) attributes.class += ' form-control';
    attributes.class = attributes.class.trim();

    attributes.name   = attrs.name    ||  attributes.name   || this.label || '';
    attributes.role   = attrs.role    ||  attributes.role   || '';
    attributes.style  = attrs.style   ||  attributes.style  || '';

    if      ( typeof( attrs.horizontal ) === "boolean" )      attributes.horizontal = attrs.horizontal
    else if ( typeof( attributes.horizontal ) === "boolean" ) attributes.horizontal = attributes.horizontal;
    else attributes.horizontal = true;

    return this;
  }

  function getAttributes(){
    return attributes;
  }

  if ( Meteor.isServer ) params.editable = function(){ return true };

  Object.defineProperties( this, {
    /**
    * Label for field
    * @property label
    * @type String
    */
    label: { value: params.label || '', writable: true },

    /**
    * Help text
    * @property helpText
    * @type String
    */
    helpText: { value: params.helpText || '' },

    /**
    * Widget name
    * @property widget
    * @type String
    */
    widget: { value: params.widget || err( 'Please add a widget to this field.' ) },


    /**
    * Attributes object
    * @property attributes
    * @type Object
    */
    attributes: { get: getAttributes, enumerable: false },


    /**
    * Set attributes object
    * @property attributes
    * @type Function
    */
    setAttributes: { value: setAttributes, enumerable: false },

    /**
    * Value unique to document
    * @property unique
    * @type Boolean
    */
    unique: { value: typeof( params.unique ) === 'boolean' ? params.unique : false },

    /**
    * Minimum length / amount
    * @property min
    * @type Number
    */
    min: { value: params.min || null },

    /**
    * Maximum length / amount
    * @property max
    * @type Number
    */
    max: { value: params.max || null },

    /**
    * Check to see if field is editable by user; client-side only
    * @method editable
    * @return Boolean
    */
    editable: { value: editable },

    /**
    * Check to see if field is editable by user; client-side only
    * @method editable
    * @return Boolean
    */
    savable: { value: savable },

    /**
    * Is this field required?
    * @property required
    * @type Boolean
    */
    required: { value: typeof( params.required ) === 'boolean' ? params.required : true },

    /**
    * Get default value for field
    * @method defaultValue
    * @return {String/Number/Array/Date}
    */
    defaultValue: { value: typeof( params.defaultValue ) === "function" ? params.defaultValue : function(){ return params.defaultValue } },
    _optional: { value: function( validator ){
      return this.required ? validator : Match.Optional( validator );
    }},

    /**
    * Function to prepare data for DOM display
    * @method toDOM
    * @return Object/String/Number
    */
    toDOM: { value: toDOM },

    /**
    * Function to prepare data for DB entry
    * @method fromDOM
    * @param value prepare/transform data from DOM for DB entry
    * @return Object/String/Number
    */
    fromDOM: { value: fromDOM },
  });
}
