/**
* @module Formation
* @submodule FieldInstance
*/

var err = function( message ){ throw new Error( message ); };

Formation.FieldInstance = function( params ){

  /**
  * FieldInstance; does the actual handling and validation of data
  * @class FieldInstance
  * @constructor
  * @param {String/Number/Date} value
  */
  function FieldInstance( value ){
    var self = this;

    Object.defineProperties( this, {
      /**
      * Actual value of field
      * @property value
      */
      value: { value: value === undefined || value === null ? self.field.defaultValue() : value, enumerable: true, writable: true },
      valueOf: { value: function(){ return self.value } },
     	_editMode: { value: new ReactiveVar( false ) },
      _errors: { value: new ReactiveVar( [] ) }
    });
  }

  Object.defineProperties( FieldInstance.prototype, {
    /**
    * Field that this instance refers to
    * @property field
    * @type Field
    */
    field: { value: params.field },

    /**
    * Function to prepare data for DOM display
    * @method toDOM
    * @return Object/String/Number
    */
    toDOM: { value: params.field.toDOM },

    /**
    * Function to prepare data for DB entry
    * @method fromDOM
    * @param value prepare/transform data from DOM for DB entry
    * @return Object/String/Number
    */
    fromDOM: { value: params.field.fromDOM },

    /**
    * Name of template widget to use for display
    * @property widget
    * @type String
    */
    widget: { value: params.field.widget },

    /**
    * Check to see if field is editable by user; client-side only
    * @method editable
    * @return Boolen
    */
    editable: { value: params.field.editable },


    /**
    * Check to see if field is savable by user;
    * @method editable
    * @return Boolen
    */
    savable: { value: params.field.savable },


    /**
    * If field is editable by user, toggle editMode
    * @method editMode
    * @param {Boolean} boo [optional]
    * @return Boolean
    */
    editMode: { value: function( boo ){
        if ( this.editable() ){
          if ( typeof( boo ) === 'undefined' ){
            this._editMode.set(! this._editMode.get() );
          } else if ( typeof( boo ) !== 'boolean' ){
            this._editMode.set( false );
          } else {
            this._editMode.set( boo );
          }
        }

        return this._editMode.get();
      }
    },


    /**
    * Returns current state of editMode
    * @method inEditMode
    * @return Boolean
    */
    inEditMode: { value: function(){
        return this._editMode.get();
      }
    },


    /**
    * Field-level errors
    * @method errors
    * @return Array
    */
    errors: { value: function(){
        return this._errors.get();
      }
    },

    pattern: { value: params.field.pattern },
    _optional: { value: params.field._optional },
    required: { value: params.field.required },
    min: { value: params.field.min },
    max: { value: params.field.max },

    /**
    * Validate instance; returns undefined on success; errors are caught and stored in _errors
    * @method validate
    */
    validate: { value: function(){
        this._errors.set( [] );

        try {
          this.value = this.fromDOM( this.value );  //if not clean already
          check( this.value, this.pattern() );
        } catch( e ){
          var errs = this._errors.get();
          errs.push( e );
          this._errors.set( errs );
        }
      }
    },


    /**
    * If field has errors, return true; else false
    * @method hasErrors
    * @return Boolean
    */
    hasErrors: { value: function(){
        return ! _.isEmpty( this.errors() );
      }
    },


    /**
    * Return plain JavaScript value
    * @method getValue
    * @return Object
    */
    getValue: { value: function(){
        // if ( this.value instanceof Array && _.isEmpty( this.value ) ){
        //   return undefined;
        // } else if ( this.value === '' && ! this.field.required ){
        //   return undefined;
        // }
        if (! this.required && ! this.value && typeof( this.value ) !== "number" ) return null;
        if ( Meteor.isServer && ! this.savable() ) return undefined;
        return this.value;
      }
    },


    /**
    * Set plain JavaScript value
    * @method getValue
    * @param {value} value
    * @return Object
    */
    setValue: { value: function setValue( value ){
      if ( value ) this.value = value;
      return this.value;
    }}

  });

  if ( params.field.choices ){
    Object.defineProperty( FieldInstance.prototype, "choices", { value: params.field.choices })
  }

  if ( params.field.filter ){
    Object.defineProperty( FieldInstance.prototype, "filter", { value: params.field.filter })
  }

  if ( params.field.model ){
    Object.defineProperty( FieldInstance.prototype, "model", { value: params.field.model })
  }

  // if ( Meteor.isServer ){
    Object.defineProperty( FieldInstance.prototype, "getUnsavableValues", { value: function getUnsavableValues(){
      if (! this.savable() ) return this.value;
    }})
  // }

  return FieldInstance;
};
