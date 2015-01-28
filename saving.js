if ( Meteor.isServer ){
  Meteor.methods({


    'Formation.update': function update( _id, doc, collectionName ){
      if (! doc || ! _id || ! collectionName ) return;

      //// find model that collection name refers to  //////////
      var model = _.find( _.values( global ), function( globs ){
        if (! globs ) return false;
        if (! globs.collection ) return false;
        return globs.collection._name === collectionName;
      });
      if (! model ) return;

      //// make instance of doc as it was saved previously //
      var prevInstance    = model.findOne( _id );
      if (! prevInstance ) return;
      doc._id             = _id;
      var instance        = new model.instance( doc );
      if (! instance.savable() )
        throw new Meteor.Error( "InadequatePermission", "You do not have permission to complete this action" );
      
      var patchedInstance = patch( prevInstance, instance );

      try {
        patchedInstance.validate();
        if ( patchedInstance.beforeSave ) patchedInstance.beforeSave();
        model.collection.update( _id, { '$set': patchedInstance.getValue() });
        if ( patchedInstance.afterSave ) patchedInstance.afterSave();

      } catch( err ){
        console.log( patchedInstance.getAllErrors() );
        console.log( patchedInstance.errors() );
        throw new Meteor.Error( 500, "Server Side Validation Error" );
      }

      return patchedInstance.getValue();
    },



    'Formation.insert': function insert( doc, collectionName ){
      if (! doc || ! collectionName ) return;

      //// find model that collection name refers to  //////////
      var model = _.find( _.values( global ), function( globs ){
        if (! globs ) return false;
        if (! globs.collection ) return false;
        return globs.collection._name === collectionName;
      });
      if (! model ) return;

      var instance = new model.newInstance( doc );
      var _id;

      if (! instance.savable() )
        throw new Meteor.Error( "InadequatePermission", "You do not have permission to complete this action" );

      try {
        instance.validate();
        if ( instance.beforeSave ) instance.beforeSave();
        _id = model.collection.insert( instance.getValue() );
        if ( instance.afterSave ) instance.afterSave();

      } catch( err ){
        console.log( instance.getAllErrors() );
        console.log( instance.errors() );
        throw new Meteor.Error( "ValidationError", "Please check this form for errors" );
      }

      return _id;
    },


    'Formation.remove': function remove( _id, collectionName ){
      if (! _id || ! collectionName ) return;

      //// find model that collection name refers to  //////////
      var model = _.find( _.values( global ), function( globs ){
        if (! globs ) return false;
        if (! globs.collection ) return false;
        return globs.collection._name === collectionName;
      });
      if (! model ) return;

      var instance = model.findOne( _id );
      if (! instance.removable() )
        throw new Meteor.Error( "InadequatePermission", "You do not have permission to complete this action" );

      return model.collection.remove( _id );
    }
  })
}



function patch( doc, patchDoc ){
  var doc = doc;

  if ( patchDoc || patchDoc.value === null ){
    if ( doc instanceof Array || patchDoc instanceof Array ){
      patchDoc = patchDoc || [];
      if (! doc ) doc = patchDoc;

      var newDocs = [];
      patchDoc.forEach( function( item, index, array ){
        var oldItem = _.find( doc, function( i ){ return i._id === item._id });
        if (! oldItem && item.savable() ) newDocs.push( item );
        else if ( oldItem ) newDocs.push( patch( oldItem, item ) );
      })
      doc.forEach( function( item, index, array ){
        var newItem = _.find( newDocs, function( i ){ return i._id === item._id });
        if (( ! item.savable() || ! item.removable() ) && ! newItem ) newDocs.push( item );
      })

      doc = newDocs;

    } else if ( doc.__name__ === "ModelInstance" ){
      if (! doc.savable() ) return doc;

      patchDoc  = patchDoc || {};
      doc       = doc || {};

      for ( var field in patchDoc ){
        doc[ field ] = patch( doc[ field ], patchDoc[ field ] );
      }

    } else {
      if (! doc.savable() ) return doc;
      var val = patchDoc.getValue();
      doc.value = val === undefined ? doc.value : val;
    }
  }

  return doc;
}



Formation.patch = patch;
