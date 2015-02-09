var min   = 3;
var max   = 20;
var value = 'purple'
var exceptions = {
  'Char': {
    'notAString':       "Please enter a string value.",
    'tooShort':         "Please enter a value longer than %min characters.",
    'tooShortTooLong':  "Please enter a value longer than %min characters and less than %max characters.",
  },
  'Number': {
    'notANumber':       "Please enter a number value.",
    'tooSmall':         "Please enter a value greater than %min.",
    'tooSmallTooBig':   "Please enter a value greater than %min and less than %max.",
  },
  'Email': {
    'notAString':       "Please enter a string value.",
    'notAnEmail':       "Please enter a valid email address.",
    'tooLong':          "Please enter an email address no longer than %max characters.",
  },
  'Slug': {
    'notAString':       "Please enter a string value.",
    'tooLong':          "Please enter a slug no longer than %max characters.",
  },
  'Array': {
    'noValue':          "Please enter a value.",
    'tooFew':           "Please enter more than %min values.",
    'tooFewTooMany':    "Please enter more than %min and less than %max values.",
  },
  'Choices': {
    'notInChoices':     '%val is not an available choice',
    'noValue':          "Please enter a value.",
    'tooFew':           "Please choose at least %min choice(s).",
    'tooFewTooMany':    "Please choose at least %min and no more than %max choices.",
  },
  'Time': {
    'notATime':         "Please enter a valid time",
    'tooEarly':         "Please enter a time value greater than %min",
    'tooLate':          "Please enter a time value less than %max",
  },
  'Date': {
    //'notADate':       "Please enter a valid date",
    'notADate':         "Please enter a date in YYYY-MM-DD format",
    'tooLate':          "Please enter a value less than %max",
    'tooEarly':         "Please enter a value greater than %min",
    'tooEarlyTooLate':  "Please enter a value greater than %min and less than %max.",
  },
  'URL': {
    'notAFullURL':      'Please include the full URL (http://...)',
    'notAURL':          "Please enter a valid URL.",
  }
};


for ( msgType in exceptions ){
  for ( msgName in exceptions[ msgType ] ){
    exceptions[ msgType ][ msgName ] = exceptions[ msgType ][ msgName ].replace( /%min/ig, min );
    exceptions[ msgType ][ msgName ] = exceptions[ msgType ][ msgName ].replace( /%max/ig, max );
    exceptions[ msgType ][ msgName ] = exceptions[ msgType ][ msgName ].replace( /%val/ig, value );
  }
}


Tinytest.add( 'Formation Core - Error Messages', function( test ){
  for ( msgType in exceptions ){
    for ( msgName in exceptions[ msgType ] ){
      var err = new Formation.Error( msgType, msgName, { min: min, max: max, value: value });
      test.equal( err.message, exceptions[ msgType ][ msgName ], "Expected error messages to be equal" );
    }
  }
})
