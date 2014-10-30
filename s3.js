// Knox = Npm.require("knox");
// var Future = Npm.require('fibers/future');
//
// var knox;
// var S3;

Meteor.methods({
	// S3config: function( obj ){
	// 	knox = Knox.createClient( obj );
	// 	S3 = { directory: obj.directory || "/" };
	// },
	//
	// S3upload: function( file, directory ){
	// 	var future = new Future();
	// 	var extension = ( file.name ).match( /\.[0-9a-z]{1,5}$/i );
	// 	var dir = directory || S3.directory;
	//
	// 	file.name = Meteor.uuid() + extension;
	// 	var path = dir + file.name;
	// 	var buffer = new Buffer( file.data );
	//
	// 	knox.putBuffer( buffer, path,
	// 		{ "Content-Type": file.type, "Content-Length": buffer.length },
	// 		function( e, r ){
	// 			if( !e ){
	// 				future.return( path );
	// 			} else {
	// 				console.log( e );
	// 			}
	// 		}
	// 	);
	//
	// 	if( future.wait() ){
	// 		var url = knox.http( future.wait() );
	// 		return url;
	// 	}
	// },
	//
	// S3delete: function( path, callback ){
	// 	knox.deleteFile( path, function( e,r ) {
	// 		if( e ){
	// 			console.log( e );
	// 		} else if( callback ){
	// 			Meteor.call( callback );
	// 		}
	// 	});
	// }

	S3GeneratePolicy: function( path, callback ){
		var sak;
		if (! Meteor.users.findOne( this.userId ) ) return Meteor.Error( 403, "Not authorized" );

		try {
			sak = Formation.Settings.S3.secretAccessKey;
		} catch( err ){
			return Meteor.Error( 500, "You have not set Formation.Settings.S3.secretAccessKey" );
		}

		// create policy
		var date1 = new Date;
		date1.setHours( 0 ); date1.setMinutes( 0 ); date1.setSeconds( 0 ); date1.setMilliseconds( 0 );
		date = date1.toISOString().replace( new RegExp( "[-:.]", "g" ), '' ).substring(0,15)+"Z";
		var lameDate = date.substring( 0, 8 );

		var cred = Formation.Settings.S3.accessKeyId || err( "Please set Formation.Settings.S3.accessKeyId" );
		var credString = [ cred, lameDate, "us-east-1", "s3", "aws4_request" ].join( "/" );

		var expiration = new Date;
		expiration.setHours( date1.getHours() + 2 );

		var policy = {
			"expiration": expiration.toISOString(),
			"conditions": [
				{ "bucket": Formation.Settings.S3.bucket || err( "Please set an S3 bucket to upload to" ) },
				[ "starts-with", "$key", path ],
				{ "acl": "public-read" },
				{ "x-amz-credential": credString },
				{ "x-amz-algorithm": "AWS4-HMAC-SHA256" },
				{ 'x-amz-date': date },
				// { "AWSAccessKey": cred }
			]
		};

		var policyString = JSON.stringify( policy );
		var policy64 = new Buffer( policyString ).toString( "base64" );
		policy.conditions.push({ "Policy": policy64 });

		// create signing key
		var cryptKey = "AWS4" + sak;
		var hmac = CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, cryptKey );
		hmac.update( lameDate );
		hmac.update( "us-east-1" );
		hmac.update( "s3" );
		hmac.update( "aws4_request" );
		hmac.update( policy64 );
		var hash = hmac.finalize();
		var signature = hash.toString( CryptoJS.enc.Hex );

		policy.conditions.push({ 'x-amz-signature': signature });
		policy.date = date;

		return policy;

	}
});
