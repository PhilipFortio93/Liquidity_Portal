var express = require('express');
var app = express();

var pg = require('pg');
var format = require('pg-format');
var PGUSER = 'pfortio';
var PGDATABASE = 'liquidity_portal_db';

var conString = "pg://pfortio:phil168912@localhost:5432/liquidity_portal_db";

var client = new pg.Client(conString);
client.connect();

app.get('/', async function (req, res) {
	var query = await client.query("SELECT name, ric FROM etf_list");
  	res.send(query['rows']);
});

app.get('/login', function(req,res){
	res.sendFile('src/index.html', {root: __dirname });

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});