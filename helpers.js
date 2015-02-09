

Formation.toTitleCase = function( str ){
  if ( typeof( str ) !== "string" ) return "";
  var str = str.toLowerCase();

  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return str.replace( /[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function( match, index, title ){
    if (  index > 0 && index + match.length !== title.length &&
          match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
          (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
          title.charAt(index - 1).search(/[^\s-]/) < 0 )
      {
        return match.toLowerCase();
      }

    if ( match.substr(1).search(/[A-Z]|\../) > -1 ){
      return match;
    }

    return match.charAt( 0 ).toUpperCase() + match.substr( 1 );
  });
};



Formation.camelToSlug = function( str ) {
  // Separate camel-cased words with a space for later processing.
  str = str.replace( /[A-Z]/g, function( s ){  return " " + s; });
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;",
      to   = "aaaaeeeeiiiioooouuuunc------";
  for ( var i=0, l=from.length; i<l; i++ ){
    str = str.replace( from[ i ], to[ i ] );
  }

  str = str.replace( /[^a-z0-9 -]/g, '' ) // remove invalid chars
  .replace( /\s+/g, '-' ) // collapse whitespace and replace by -
  .replace( /-+/g, '-'); // collapse dashes

  // Trim leading and trailing whitespace and dashes.
  str = str.replace(/^[\s|-]+|[\s|-]+$/g, '');

  return str;
};



Formation.camelToTitleCase = function( string ) {
  var i, str, lowers, uppers;
  var str = string.split( /(?=[A-Z])/ );
  for ( var j=0; j < str.length; j++ ){
    str[ j ] = Formation.toTitleCase( str[ j ] );
  }
  str = str.join( " " );

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
  'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
  for (i = 0; i < lowers.length; i++)
      str = str.replace( new RegExp('\\s' + lowers[i] + '\\s', 'g' ),
          function( txt ) {
              return txt.toLowerCase();
          });

  // Certain words such as initialisms or acronyms should be left uppercase
  uppers = [ 'Id', 'Tv' ];
  for ( i = 0; i < uppers.length; i++ )
      str = str.replace( new RegExp('\\b' + uppers[i] + '\\b', 'g' ),
          uppers[ i ].toUpperCase());

  return str;
};
