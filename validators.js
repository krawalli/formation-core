
///////////////////////
//  Extra Validators
///////////////////////


Formation.Validators = Formation.Validators || {};


// Email validator
Object.defineProperty( Formation.Validators, "Email", {
  value: function( min, max ){
    var mailpattern = /^(([^<>\(\)\[\]\.,;:\s@"]+(.[^<>\(\)\[\]\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3})|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/gmi;

    return Match.Where( function( value ){
      try {
        check( value, String );
      } catch( error ){
        throw new Formation.Error( "Email", "notAString" );
      }
      if (! mailpattern.test( value )) {
        throw new Formation.Error( "Email", "notAnEmail" );
      }
      if ( ( min !== undefined && value.length < min ) || ( max !== undefined &&  value.length > max ) ){
        throw new Formation.Error( "Email", "tooLong", { value: value, min: min, max: max });
      }
      return true;
    });
  },
  enumerable: true
});



// Slug Validator
Object.defineProperty( Formation.Validators, "Slug", {
  value: function( min, max ){
    return Match.Where( function( value ){
      try {
        check( value, String );
      } catch( error ){
        throw new Formation.Error( "Slug", "notAString" );
      }
      if ( ( min !== null && value.length < min ) || ( max !== null &&  value.length > max ) ){
        throw new Formation.Error( "Slug", "tooLong", { value: value, min: min, max: max });
      }
      return true;
    });
  },
  enumerable: true
});


// Char Validator
Object.defineProperty( Formation.Validators, "BasicChar", {
  value: function( min, max ){
    return Match.Where( function( value ){
      try {
        check( value, String );
      } catch( error ){
        throw new Formation.Error( "Char", "notAString", { value: value, min: min, max: max });
      }
      if ( value.length < min || ( max && value.length > max ) ){
        if ( !max ){
          throw new Formation.Error( "Char", "tooShort", { value: value, min: min, max: max });
        } else {
          throw new Formation.Error( "Char", "tooShortTooLong", { value: value, min: min, max: max });
        }
      }
      return true;
    });
  },
  enumerable: true
});



var ArrayValidator = function( validator, min, max ){
  return Match.Where( function( value ){
    try {
      check( value, Array );
    } catch( e ){
      throw new Formation.Error( "Array", "noValue", { value: value, min: min, max: max });
    }

    check( value, [ validator( min ) ] );
    if ( value.length < min || ( max && value.length > max ) ){
      if (! max ){
        throw new Formation.Error( "Array", "tooFew", { value: value, min: min, max: max });
      } else {
        throw new Formation.Error( "Array", "tooFewTooMany", { value: value, min: min, max: max });
      }
    }
    return true;
  });
};


// Char Array validator
Object.defineProperty( Formation.Validators, "CharArray", {
  value: function( min, max ){
    return ArrayValidator( Formation.Validators.BasicChar, min, max );
  },
  enumerable: true
});


// Basic Number validator
Object.defineProperty( Formation.Validators, "BasicNumber", {
  value: function( min, max ){
    return Match.Where( function( value ){
      try {
        check( value, Number );
      } catch( error ){
        throw new Formation.Error( "Number", "notANumber", { value: value, min: min, max: max });
      }

      if (! value && value !== 0 )
        throw new Formation.Error( "Number", "notANumber", { value: value, min: min, max: max });

      if ( ( typeof( min )==='number' && value < min ) || ( max && value > max ) ){
        if ( !max ){
          throw new Formation.Error( "Number", "tooSmall", { value: value, min: min, max: max });
        } else {
          throw new Formation.Error( "Number", "tooSmallTooBig", { value: value, min: min, max: max });
        }
      }
      return true;
    })
  },
  enumerable: true
});

// Number Array Validator
Object.defineProperty( Formation.Validators, "NumberArray", {
  value: function( min, max ){
    return ArrayValidator( Formation.Validators.BasicNumber, min, max );
  },
  enumerable: true
});


// Value is in Array
Object.defineProperty( Formation.Validators, "ValueIsInChoices", {
  value: function( choices ){
    return Match.Where( function( value ){
      if ( ! _.contains( choices, value ) ){
        throw new Formation.Error( "Choices", "notInChoices", { value: value });
      } else {
        return true;
      }
    });
  },
  enumerable: true
});


// Check each value for presence in array
Object.defineProperty( Formation.Validators, "ChoicesArray", {
  value: function( choices, min, max ){
    return Match.Where( function( value ){
      try {
        check( value, Array );
      } catch( e ){
        throw new Formation.Error( "Choices", "noValue", { value: value, min: min, max: max });
      }

      check( value, [ Formation.Validators.ValueIsInChoices( choices ) ] );
      if ( ( min !== null && value.length < min ) || ( max !== null &&  value.length > max ) ){
        if ( max !== null ){
          throw new Formation.Error( "Choices", "tooFewTooMany", { value: value, min: min, max: max });
        } else {
          throw new Formation.Error( "Choices", "tooFew", { value: value, min: min, max: max });
        }
      }
      return true;
    });
  },
  enumerable: true
});


// Time validator
Object.defineProperty( Formation.Validators, "Time", {
  value: function( min, max ){
    return Match.Where( function( value ){
      if (! _.isObject( value ) ){
        throw new Formation.Error( "Time", "notATime", { value: value, min: min, max: max });
      }
      if ( min &&
        ( ( value.hour < min.hour ) ||
            ( value.hour === min.hour && value.minute < min.minute ) ||
            ( value.hour === min.hour && value.minute === min.minute && value.second < min.second ) )
        ){
        throw new Formation.Error( "Time", "tooEarly", { value: value, min: min, max: max });
      }

      if ( max &&
        ( ( value.hour > max.hour ) ||
            ( value.hour === max.hour && value.minute > max.minute ) ||
            ( value.hour === max.hour && value.minute === max.minute && value.second > max.second ) )
        ){
        throw new Formation.Error( "Time", "tooLate", { value: value, min: min, max: max });
      }

      return true;
    });
  },
  enumerable: true
});


// Date validator
Object.defineProperty( Formation.Validators, "Date", {
  value: function( min, max ){
    return Match.Where( function( value ){
      try {
        check( value, Date );
      } catch( e ){
        throw new Formation.Error( "Date", "notADate" );
      }

      if ( ( min !== null && value < min ) || ( max !== null && value > max ) ){
        if ( min === null ){
          throw new Formation.Error( "Date", "tooLate", { value: value, min: min, max: max });
        } else if ( max === null ){
          throw new Formation.Error( "Date", "tooEarly", { value: value, min: min, max: max });
        } else {
          throw new Formation.Error( "Date", "tooEarlyTooLate", { value: value, min: min, max: max });
        }
      }

      if (! +value ) throw new Formation.Error( "Date", "notADate" );

      return true;
    })
  },
  enumerable: true
});


// URL validator
Object.defineProperty( Formation.Validators, "URL", {
  value: function(){
    return Match.Where( function( value ){
      try {
        check( value, Formation.Validators.BasicChar( 10 ) );
      } catch( e ){
        throw new Formation.Error( "URL", "notAFullURL", { value: value, min: min, max: max });
      }
      var regex = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})(\/.*)*\/?$/;
      if (! value.match( regex ) ){
        throw new Formation.Error( "URL", "notAURL" );
      }

      return true;
    })
  },
  enumerable: true
});
