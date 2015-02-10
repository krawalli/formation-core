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

    var patchedInstance = prevInstance.setValue( instance );

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
      console.log( err );
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
