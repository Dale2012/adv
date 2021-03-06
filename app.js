
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , adv = require('./routes/adv')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(express.bodyParser({uploadDir:'./upload'}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/adv_show', adv.show);
app.get('/index.php/adv_show', adv.show);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


