var Fields  = Formation.Fields;
var Model   = Formation.Model;

Tinytest.add( "Formation Core - Getting Values", function( test ){
  var char, charInstance;

  char          = new Fields.Char({ max: 255 });
  charInstance  = new char.instance( "Strings and things" );
  test.equal( charInstance.getValue(), "Strings and things", "Fields.Char getValue should return string value" );

  char          = new Fields.Char({ max: 255 });
  charInstance  = new char.instance( "" );
  test.equal( charInstance.getValue(), "", "Fields.Char getValue, if value is falsy, should return null when not required" );

  char          = new Fields.Char({ max: 255, required: false });
  charInstance  = new char.instance( "Strings and things" );
  test.equal( charInstance.getValue(), "Strings and things", "Fields.Char getValue, if value is not falsy, should return string value when not required" );

  char          = new Fields.Char({ max: 255, required: false });
  charInstance  = new char.instance( "" );
  test.equal( charInstance.getValue(), null, "Fields.Char getValue, if value is falsy, should return null when not required" );

});
