Meteor.methods({
  'Formation.update': function update( _id, doc, collectionName ){
    if (! doc || ! _id || ! collectionName ) return;

    var model = _.find( _.values( global ), function( globs ){
      if (! globs ) return false;
      if (! globs.collection ) return false;
      return globs.collection._name === collectionName;
    });
    if (! model ) return;

    var prevDoc       = model.collection.findOne( _id );
    if (! prevDoc ) return;
    var prevInstance  = new model.instance( prevDoc );
    delete prevDoc._id;

    doc._id         = _id;
    var instance    = new model.instance( doc );
    delete doc._id;
    var newDoc      = instance.getValue();

    var resetValues = prevInstance.getUnsavableValues();
    if (! _.isEmpty( resetValues ) ) newDoc = patch( newDoc, resetValues, true );
    var patchedDoc  = patch( prevDoc, newDoc );

    instance.setValue( patchedDoc );

    try {
      instance.validate();
    } catch( err ){
      console.log( instance.getAllErrors() );
      console.log( instance.errors() );
      throw new Meteor.Error( 500, "Server Side Validation Error" );
    }


    model.collection.update( _id, { '$set': patchedDoc });
    return _.pick( patchedDoc, _.keys( model.fieldsFilter() ) );
  }
})


function patch( doc, patchDoc, joinArrays ){
  var doc = doc;
  var joinArrays = joinArrays || false;

  if ( patchDoc || patchDoc === null ){
    if ( doc instanceof Array || patchDoc instanceof Array ){
      patchDoc = patchDoc || [];

      if (! doc ){
        doc = patchDoc;
      } else {
        var newDocs = [];
        patchDoc.forEach( function( item, index, array ){
          var oldItem = _.find( doc, function( i ){ return i._id === item._id });
          if (! oldItem ) newDocs.push( item );
          else newDocs.push( patch( oldItem, item, joinArrays ) );
        })
        if ( joinArrays ){
          doc.forEach( function( item, index, array ){
            var oldItem = _.find( patchDoc, function( i ){ return i._id === item._id });
            if (! oldItem ) newDocs.push( item );
          })
        }
        doc = newDocs;
      }

    } else if ( doc instanceof Date || patchDoc instanceof Date ){
      doc = patchDoc || doc;

    } else if ( _.isObject( doc ) || _.isObject( patchDoc ) ){
      patchDoc  = patchDoc || {};
      doc       = doc || {};

      for ( var field in patchDoc ){
        doc[ field ] = patch( doc[ field ], patchDoc[ field ], joinArrays );
      }

    } else {
      doc = patchDoc === undefined ? doc : patchDoc;
    }
  }

  return doc;
}
