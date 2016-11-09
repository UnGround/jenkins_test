
module.exports = function(app) {

	var express = require('express');
	var path = require('path');
	var router = express.Router();
	var rest = require('restler');

	var credentials = {
		client: {
			id: 'UNAME',
			secret: 'PASS'
		},
		auth: {
			tokenHost: 'TOKEN'
		}
	};

	var oauth2 = require('simple-oauth2').create(credentials);

	var state = Math.random()*1128;
	var redirectURL = 'REDIR'

	var authorizationUri = oauth2.authorizationCode.authorizeURL({
	  redirect_uri: redirectURL,
	  scope: 'openid',
	  state: state
	});

	app.get('/ssologin', function(req, res, next){
		console.log("logging in");
        res.redirect(authorizationUri);
    });

    app.get('/secure', function(req, res, next) {
    	console.log("redirected, saving code");
    	var code = req.query.code;
    	var curState = req.query.state;

    	if (state != curState) {
    		console.log("Warning: State has been tampered with");
    		//TODO: prevent login without valid state
    	}
    	var tokenConfig = {
		  code: code,
		  redirect_uri: redirectURL
		};
		console.log("Code: " + code);
		oauth2.authorizationCode.getToken(tokenConfig)
		.then((result) => {
			const token = oauth2.accessToken.create(result);
			console.log("token: " + token);
			rest.get(credentials.auth.tokenHost + '/userinfo', {
			    timeout: 3600,
			    headers: { 'Authorization' : 'Bearer ' + token.token.access_token }
			  }).on('complete', function(data, response) {
			  	console.log(data);
			  });
		})
		.catch((error) => {
		  	console.log(error);
		    return console.log('Access Token Error', error.message);
		});


		

		res.redirect('/');
    });

}