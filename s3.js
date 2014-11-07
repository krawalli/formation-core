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
		if (! Meteor.users.findOne( this.userId ) ) return Meteor.Error( 403, "Not authorized" );

		var accessKey = Formation.Settings.S3.accessKeyId || meteorError( 500, "Please set Formation.Settings.S3.accessKeyId" );
		var secretAccessKey = Formation.Settings.S3.secretAccessKey || meteorError( 500, "You have not set Formation.Settings.S3.secretAccessKey" );
		var bucket = Formation.Settings.S3.bucket || meteorError( 500, "Please set an S3 bucket to upload to" );

		var region = "us-east-1";
		var service = "s3";
		var version = "aws4_request";
		var date1 = new Date;

		// set date to year-day-monthT00:00:00
		date1.setHours( 0 ); date1.setMinutes( 0 ); date1.setSeconds( 0 ); date1.setMilliseconds( 0 );

		// format: YYYYMMDDTHHMMSSZ
		var date = date1.toISOString().replace( new RegExp( "[-:.]", "g" ), '' ).substring(0,15)+"Z";

		//format: YYYYMMDD
		var lameDate = date.substring( 0, 8 );

		// key/date/aws-region/aws-service/aws4_request
		var credString = [ accessKey, lameDate, region, service, version ].join( "/" );

		// expires 2 hours from now
		var expiration = new Date;
		expiration.setHours( date1.getHours() + 2 );

		// put into object
		var requestOb = {
			expires: expiration.toUTCString(),
			expiration: expiration.toISOString(),
			algorithm: "AWS4-HMAC-SHA256",
			date: date,
			credential: credString,
			acl: "public-read",
			bucket: bucket
		};

		// policy to encrypt
		var policyToSign = {
			"expiration": requestOb.expiration,
			"conditions": [
				{ "bucket": requestOb.bucket },
				[ "starts-with", "$key", path ],
				{ "acl": requestOb.acl },
				{ "x-amz-credential": requestOb.credential },
				{ "x-amz-algorithm":  requestOb.algorithm },
				{ 'x-amz-date': requestOb.date },
			]
		};

		var policyString = JSON.stringify( policyToSign );
		var policy64 = new Buffer( policyString ).toString( "base64" );
		requestOb.policy64 = policy64;

		// create signing key
		var cryptKey = "AWS4" + secretAccessKey;
		var hmac = CryptoJS.algo.HMAC.create( CryptoJS.algo.SHA256, cryptKey );
		hmac.update( lameDate );
		hmac.update( region );
		hmac.update( service );
		hmac.update( version );
		hmac.update( policy64 );
		var hash = hmac.finalize();
		var signature = hash.toString( CryptoJS.enc.Hex );

		requestOb.signature = signature;

		return requestOb;
	}
});
