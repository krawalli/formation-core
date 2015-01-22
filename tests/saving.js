var Fields  = Formation.Fields;
var Model   = Formation.Model;


if ( Meteor.isServer ){

  function createTestDoc(){
    var basicDoc = {
      requiredChar: "Name",
      char: "Description",
      requiredNumber: 0,
      number: 1,
      requiredTags: [ "art", "music", "science", "fun" ],
      tags: [ "art", "music", "science", "fun" ],
    };

    var arrayDoc = _.clone( basicDoc );
    arrayDoc._id = "456";

    var oldDoc = _.clone( basicDoc );
    _.extend( oldDoc, {
      requiredNested: _.clone( basicDoc ),
      nested:         _.clone( basicDoc ),
      array:          [ arrayDoc ],
    });

    return oldDoc;
  }


  // mock collection to return what we want
  function collection( name, options ){
    this._name    = name;
    this.update   = function( selector, doc ){ return 1; };
    this.findOne  = function( selector, options ){
      return createTestDoc();
    };
  };
  collection.prototype = Object.create( Meteor.Collection.prototype );


  // stub function to retrieve userId
  Meteor.userId = function(){
    return "123";
  };


  // standard basic schema
  var schema = {
    requiredChar:     new Fields.Char({ max: 255 }),
    char:             new Fields.Char({ max: 255, required: false }),
    requiredNumber:   new Fields.Number,
    number:           new Fields.Number({ required: false }),
    requiredTags:     new Fields.CharArray,
    tags:             new Fields.CharArray({ required: false }),
  };

  var nested          = Model({ schema: _.clone( schema ) });
  var array           = Model({ schema: _.clone( schema ), extra: 0 });
  var formSchema      = _.clone( schema );
  _.extend( formSchema, {
    nested:         nested,
    array:          [ array ],
  })

  global.FormThing = Model({
    collection: new collection( "formThings" ),
    schema: formSchema
  });



  testAsyncMulti( "Formation Core - Saving & Updating", [

    function simpleUpdateCall( test, expect ){
      var oldDoc    = createTestDoc();
      var updateDoc = {
        char: null,
        requiredChar: null,
        number: null,
        requiredNumber: null,
        tags: null,
        requiredTags: null,
        nested: {
          char: null,
          requiredChar: null,
          number: null,
          requiredNumber: null,
          tags: null,
          requiredTags: null,
        },
        array: [
          {
            _id: "123",
            requiredChar: "Name2",
            char: null,
            requiredNumber: 1,
            number: null,
            requiredTags: [ "art", "music", "science" ],
            tags: null,
          },
          {
            _id: "456",
            requiredChar: null,
            char: null,
            requiredNumber: null,
            number: null,
            requiredTags: [ "art", "music", "science", "fun" ],
            tags: null,
          },
        ]
      };

      Meteor.call( "Formation.update", 'id', updateDoc, "formThings", expect( function( err, res ){
        console.log( err );

        test.equal( res.requiredChar,   "Name",  "Expected new document <requiredChar> to be to be 'Name'." );
        test.equal( res.char,           null,    "Expected new document <char> to be to be null." );
        test.equal( res.requiredNumber, 0,       "Expected new document <requiredNumber> to be to be 0." );
        test.equal( res.number,         null,    "Expected new document <number> to be to be null." );

        test.isTrue( _.isEmpty( _.difference( res.requiredTags, oldDoc.requiredTags )),  "Expected new document <requiredTags> to be unchanged" );
        test.isTrue( _.isEmpty( res.tags ), "Expected new document <tags> to be to be empty array." );

        test.equal( res.nested.requiredChar,   "Name",  "Expected new document <requiredChar> to be to be 'Name'." );
        test.equal( res.nested.char,           null,    "Expected new document <char> to be to be null." );
        test.equal( res.nested.requiredNumber, 0,       "Expected new document <requiredNumber> to be to be 0." );
        test.equal( res.nested.number,         null,    "Expected new document <number> to be to be null." );

        test.isTrue( _.isEmpty( _.difference( res.nested.requiredTags, oldDoc.nested.requiredTags )),  "Expected new document <requiredTags> to be unchanged" );
        test.isTrue( _.isEmpty( res.nested.tags ), "Expected new document <tags> to be to be empty array." );

        var arrayDoc0     = _.find( res.array, function( doc ){ return doc._id === "123"; });
        var arrayDoc1     = _.find( res.array, function( doc ){ return doc._id === "456";});
        var oldArrayDoc0  = _.find( updateDoc.array, function( doc ){ return doc._id === "123"; });
        var oldArrayDoc1  = _.find( updateDoc.array, function( doc ){ return doc._id === "456"; });

        test.equal( arrayDoc0.requiredChar,   "Name2",  "Expected new document <requiredChar> to be to be 'Name'." );
        test.equal( arrayDoc0.char,           null,    "Expected new document <char> to be to be null." );
        test.equal( arrayDoc0.requiredNumber, 1,       "Expected new document <requiredNumber> to be to be 0." );
        test.equal( arrayDoc0.number,         null,    "Expected new document <number> to be to be null." );

        test.isTrue( _.isEmpty( _.difference( arrayDoc0.requiredTags, oldArrayDoc0.requiredTags )),  "Expected new document <requiredTags> to be unchanged" );
        test.isTrue( _.isEmpty( arrayDoc0.tags ), "Expected new document <tags> to be to be empty array." );

        test.equal( arrayDoc1.requiredChar,   "Name",  "Expected new document <requiredChar> to be to be 'Name'." );
        test.equal( arrayDoc1.char,           null,    "Expected new document <char> to be to be null." );
        test.equal( arrayDoc1.requiredNumber, 0,       "Expected new document <requiredNumber> to be to be 0." );
        test.equal( arrayDoc1.number,         null,    "Expected new document <number> to be to be null." );

        test.isTrue( _.isEmpty( _.difference( arrayDoc1.requiredTags, oldArrayDoc1.requiredTags )),  "Expected new document <requiredTags> to be unchanged" );
        test.isTrue( _.isEmpty( arrayDoc1.tags ), "Expected new document <tags> to be to be empty array." );
      }))
    },



    function removeAndAddToArray( test, expect ){
      var updateDoc = {
        array: [
          {
            _id: "123",
            requiredChar: "Name2",
            char: null,
            requiredNumber: 1,
            number: null,
            requiredTags: [ "art", "music", "science" ],
            tags: null,
          },
        ]
      };

      Meteor.call( "Formation.update", "id", updateDoc, "formThings", expect( function( err, res ){
        var removedArray = _.find( res.array, function( doc ){ return doc._id === "456"; })
        test.isUndefined( removedArray, "Array with _id should be removed from patched document" );

        var addedArray = _.find( res.array, function( doc ){ return doc._id = "123"; });
        test.isFalse( _.isEmpty( addedArray ), "Array with _id '123' should exist in patched document.")
      }))
    },



    function restrictedRemoveAndAddToArrayDeny( test, expect ){
      var restrictedFormSchema = _.clone( schema );
      _.extend( restrictedFormSchema, {
        array: [ Model({
          schema: _.clone( schema ),
          savable: function(){ return Meteor.userId() === "456"; }
        }) ]
      });
      global.RestrictedFormThing = Model({
        collection: new collection( "restrictedFormThings" ),
        schema: restrictedFormSchema
      });

      var updateDoc = {
        array: [
          {
            _id: "123",
            requiredChar: "Name2",
            char: null,
            requiredNumber: 1,
            number: null,
            requiredTags: [ "art", "music", "science" ],
            tags: null,
          },
        ]
      };

      Meteor.call( "Formation.update", "id", updateDoc, "restrictedFormThings", expect( function( err, res ){
        var attemptedRemovedArray = _.find( res.array, function( doc ){ return doc._id === "456"; })
        test.isFalse( _.isEmpty( attemptedRemovedArray ), "Array with _id should not be removed from patched document" );

        var attemptedAddedArray = _.find( res.array, function( doc ){ return doc._id === "123"; });
        test.isUndefined( attemptedAddedArray, "Array with _id '123' should not exist in patched document." );
      }))
    },



    function restrictedRemoveAndAddToArrayAccept( test, expect ){
      var restrictedFormSchema = _.clone( schema );
      _.extend( restrictedFormSchema, {
        array: [ Model({
          schema: _.clone( schema ),
          savable: function(){ return Meteor.userId() === "123"; }
        }) ]
      });
      global.RestrictedFormThing = Model({
        collection: new collection( "restrictedFormThings" ),
        schema: restrictedFormSchema
      });

      var updateDoc = {
        array: [
          {
            _id: "123",
            requiredChar: "Name2",
            char: null,
            requiredNumber: 1,
            number: null,
            requiredTags: [ "art", "music", "science" ],
            tags: null,
          },
        ]
      };

      Meteor.call( "Formation.update", "id", updateDoc, "restrictedFormThings", expect( function( err, res ){
        var attemptedRemovedArray = _.find( res.array, function( doc ){ return doc._id === "456"; })
        test.isUndefined( attemptedRemovedArray, "Array with _id '456' should be removed from patched document" );

        var attemptedAddedArray = _.find( res.array, function( doc ){ return doc._id = "123"; });
        test.isFalse( _.isEmpty( attemptedAddedArray ), "Array with _id '123' should exist in patched document." );
      }))
    },


  ])
}
