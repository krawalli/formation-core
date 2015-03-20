Formation.Settings.Messages = Formation.Settings.Messages || {};


var replaceables = {
  'min':    /%min/ig,
  'max':    /%max/ig,
  'value':  /%val/ig,
  'error':  /%error/ig
};


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
  },
  'EJSON': {
    'notParsable': 'Please enter a valid JSON structure - current error is: %error.'
  }
};



for ( msgType in exceptions ){
  var msgObj = {};

  for ( msg in exceptions[ msgType ] ){
    Object.defineProperty( msgObj, msg, {
      get: function(){ return exceptions[ msgType ][ msg ] },
      set: function( val ){
        if ( typeof( val ) !== 'string' ) return;
        return exceptions[ msgType ][ msg ] = val;
      }
    });
  }

  Object.defineProperty( Formation.Settings.Messages, msgType, { value: msgObj });
}



function formationError( msgType, msgName, options ){
  var message = exceptions[ msgType ][ msgName ];
  var options = options || {};

  for ( key in replaceables ){
    if ( options[ key ] instanceof Date )
      message = message.replace( replaceables[ key ], options[ key ].toLocaleString() );
    else
      message = message.replace( replaceables[ key ], options[ key ] || '' );
  }

  this.message  = message;
  this.name     = msgName;
}
formationError.prototype = Object.create( Error.prototype );
Object.defineProperty( Formation, 'Error', { value: formationError });
