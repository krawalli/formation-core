
///////////////////////
//  Extra Validators
///////////////////////


Formation.Validators = Formation.Validators || {};


// Email validator
Object.defineProperty( Formation.Validators, "Email", {
  value: function( min, max ){
    return Match.Where( function( value ){
      try {
        check( value, String );
      } catch( error ){
        throw new Error( "Please enter a string value." );
      }
      if ( value.indexOf( '@' ) === -1 || value.indexOf( '.' ) === -1 ){
        throw new Error( "Please enter a valid email address." );
      }
      if ( ( min !== undefined && value.length < min ) || ( max !== undefined &&  value.length > max ) ){
        throw new Error( "Please enter an email address no longer than " + max + " characters." );
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
        throw new Error( "Please enter a string value." );
      }
      if ( ( min !== null && value.length < min ) || ( max !== null &&  value.length > max ) ){
        throw new Error( "Please enter a slug no longer than " + max + " characters." );
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
        throw new Error( "Please enter a string value." );
      }
      if ( value.length < min || ( max && value.length > max ) ){
        if ( !max ){
          throw new Error( "Please enter a value longer than " + min + " characters." );
        } else {
          throw new Error( "Please enter a value longer than " + min + " characters and less than " + max + " characters." );
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
      throw new Error( "Please enter a value." );
    }

    check( value, [ validator( min ) ] );
    if ( value.length < min || ( max && value.length > max ) ){
      if (! max ){
        throw new Error( "Please enter more than " + min + " values." );
      } else {
        throw new Error( "Please enter more than " + min + " and less than " + max + " values." );
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
        throw new Error( "Please enter a number value." );
      }
      if ( ( typeof( min )==='number' && value < min ) || ( max && value > max ) ){
        if ( !max ){
          throw new Error( "Please enter a value greater than " + min + "." );
        } else {
          throw new Error( "Please enter a value greater than " + min + " and less than " + max + "." );
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
      if ( value !== undefined && ! _.contains( choices, value ) ){
        throw new Error( value.toString() + ' is not an available choice' );
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
        throw new Error( "Please enter a value." );
      }

      check( value, [ Formation.Validators.ValueIsInChoices( choices ) ] );
      if ( ( min !== null && value.length < min ) || ( max !== null &&  value.length > max ) ){
        if ( max !== null ){
          throw new Error( "Please choose at least " + min + " and no more than " + max + " choices." );
        } else {
          throw new Error( "Please choose at least " + min + " choice(s)." );
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
        throw new Error( "Please enter a time object with {hour[,minute,second]}" );
      }
      if ( min &&
        ( ( value.hour < min.hour ) ||
            ( value.hour === min.hour && value.minute < min.minute ) ||
            ( value.hour === min.hour && value.minute === min.minute && value.second < min.second ) )
        ){
        throw new Error( "Please enter a time value greater than " + [ min.hour, min.minute, min.second ].join( ':' ) );
      }

      if ( max &&
        ( ( value.hour > max.hour ) ||
            ( value.hour === max.hour && value.minute > max.minute ) ||
            ( value.hour === max.hour && value.minute === max.minute && value.second > max.second ) )
        ){
        throw new Error( "Please enter a time value less than " + [ max.hour, max.minute, max.second ].join( ':' ) );
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
        throw new Error( "Please enter a date in YYYY-MM-DD format" );
      }

      if ( ( min !== null && value < min ) || ( max !== null && value > max ) ){
        if ( min === null ){
          throw new Error( "Please enter a value less than " + max.toLocaleString() + "." );
        } else if ( max === null ){
          throw new Error( "Please enter a value greater than " + min.toLocaleString() );
        } else {
          throw new Error( "Please enter a value greater than " + min.toLocaleString() + " and less than " + max.toLocaleString() + "." );
        }
      }

      if (! +value ) throw new Error( "Please enter a valid date" );

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
        throw new Error( 'Please include the full URL (http://...)');
      }
      var regex = /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (! value.match( regex ) ){
        throw new Error( "Please enter a valid URL." );
      }

      return true;
    })
  },
  enumerable: true
});
