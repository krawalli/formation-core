

Formation.ModelInstance = function( params ){

  params.__name__ = "ModelInstance";

  var superinstance = ModelInstanceSuper( params );

  /**
  * ModelInstance representation of database document; usually created by doing 'new MyModel.instance( data )'; will update, not insert.
  * @class ModelInstance
  * @constructor
  * @extends ModelSuper
  * @param {Object} data      Data to create ModelInstance with
  */
  function ModelInstance( data ){
    var data = arguments[ 0 ] || {};
    Object.defineProperty( this, "_editMode", {
      value: new ReactiveVar( false ),
      writable: true,
      enumerable: false
    });
    superinstance.call( this, data );

    // add _id as unwritable, non-enumerable property
    if ( this._model.collection ){
      Object.defineProperty( this, "_id", {
        value: data._id,
        enumerable: false
      });
    }
  }

  ModelInstance.prototype = Object.create( superinstance.prototype );

  Object.defineProperties( ModelInstance.prototype, {

    /**
    * Delete documents from DB
    * @method delete
    */
    delete: { value: function(){
        this._model.collection.remove( this._id );
      }
    }
  });

  return ModelInstance;
};
