'use strict';
const https = require('https');
const http = require('http');
var cheerio = require('cheerio');
var annonces = [], $;
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.emailfrom,
        pass: process.env.pass
    }
});

let mailOptions = {
    from: '"Eul bon oinc 👻" <' + process.env.emailfrom + '>', // sender address
    to: process.env.emailto, // list of receivers
    subject: 'New alerts ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

function lbc(callback) {
	callback();
	https.get(process.env.url, (res) => {
	  let rawData = '', newAnnonces = false, body = '';
	  res.on('data', (chunk) => rawData += chunk);
	  res.on('end', () => {
	    try {
	      $ = cheerio.load(rawData);
	      $('li[itemtype="http://schema.org/Offer"] a').each((i, el) => {
	  		let title = '', href = '';
	      	title = el.attribs.title;
	      	href = el.attribs.href;
	      	if (annonces.indexOf(href) === -1) {
	      		annonces.push(href);
	      		newAnnonces = true;
	      		body += '<p>' + title + '</p><p>' + href.replace('//', 'https://') + '</p>';
	      	}
	      });
	      if (newAnnonces) {
			  mailOptions.html = JSON.stringify(body);
			  mailOptions.text = JSON.stringify(body);
			  transporter.sendMail(mailOptions, (error, info) => {
				    if (error) {
				        return console.log(error);
				    }
				    console.log('Message %s sent: %s', info.messageId, info.response);
				});
			  console.log('nouvelles annonces')
			} else {
			  console.log('aucune nouvelle annonce')
			}
	    } catch (e) {
	      console.log(e.message);
	      mailOptions.html = JSON.stringify(e.message);
	      mailOptions.text = JSON.stringify(e.message);
	      transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
			    return console.log(error);
			}
			console.log('Message %s sent: %s', info.messageId, info.response);
			});
	    }
	  });
	}).on('error', (e) => {
	  console.error(e);
	});
};


function wait10min(){
    setTimeout(function(){
        lbc(wait10min);
    }, 10 * 60 * 1000);
}

lbc(wait10min);

var proxy = http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('okay');
});

proxy.listen(8080, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", 8080);
});