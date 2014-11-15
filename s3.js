
Meteor.methods({

	S3GeneratePolicy: function( options, callback ){
		if (! Meteor.users.findOne( this.userId ) ) throw new Meteor.Error( "not-logged-in", "You must be logged in to upload." );
		var options = options || {};

		var accessKey = Formation.Settings.S3.accessKeyId || meteorError( "s3-not-configured", "Please set Formation.Settings.S3.accessKeyId" );
		var secretAccessKey = Formation.Settings.S3.secretAccessKey || meteorError( "s3-not-configured", "You have not set Formation.Settings.S3.secretAccessKey" );
		var bucket = options.bucket || Formation.Settings.S3.bucket || meteorError( "s3-not-configured", "Please set an S3 bucket to upload to" );

		var path = options.path || '';
		var type = options.type || 'text';
		var region = "us-east-1";
		var service = "s3";
		var version = "aws4_request";
		var date1 = new Date;
		var algorithm = "AWS4-HMAC-SHA256";
		var acl = "public-read";

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
		expiration.setHours( expiration.getHours() + 2 );

		// policy to encrypt
		var policyToSign = {
			"expiration": expiration.toISOString(),
			"conditions": [
				{ "acl": acl },
				{ "expires": expiration.toUTCString() },
				[ "starts-with", "$Content-Type", type ],
				[ "starts-with", "$key", path ],
				{ "x-amz-algorithm":  algorithm },
				{ "x-amz-credential": credString },
				{ 'x-amz-date': date },
				{ "bucket": bucket },
			]
		};

		var policyString = JSON.stringify( policyToSign );
		var policy64 = new Buffer( policyString ).toString( "base64" );

		// create signing key
		var cryptKey = "AWS4" + secretAccessKey;
		var dateKey 	= CryptoJS.HmacSHA256( lameDate, cryptKey );
		var regionKey = CryptoJS.HmacSHA256( region, dateKey );
		var serviceKey = CryptoJS.HmacSHA256( service, regionKey );
		var regionKey = CryptoJS.HmacSHA256( version, serviceKey );

		var sig = CryptoJS.HmacSHA256( policy64, regionKey );
		var signature = sig.toString( CryptoJS.enc.Hex );


		// put into object
		var requestOb = {
			'acl': acl,
			'Expires': expiration.toUTCString(),
			'Content-Type': type +'/',
			'key': path + "${filename}",
			'Policy': policy64,
			'x-amz-algorithm': algorithm,
			'x-amz-credential': credString,
			'x-amz-date': date,
			'x-amz-signature': signature,
			'bucket': bucket,
		};

		return requestOb;
	}
});


function meteorError( reason, message ){
	throw new Meteor.Error( reason, message );
}
