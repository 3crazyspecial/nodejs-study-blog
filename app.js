
/**
 * Module dependencies.
 */
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flag: 'a'});
var errorLog = fs.createWriteStream('error.log', {flag: 'a'});
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var flash = require('connect-flash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());

app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
// app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.bodyParser())
app.use(express.bodyParser({keepExtensions: true, uploadDir: './public/images'})); // 保留文件的后缀名，设置上传目录
app.use(express.methodOverride()); // connect内建中间件，可以协助处理post请求

app.use(express.cookieParser()); 
app.use(express.session({
	secret: settings.cookieSecret,
	key: settings.db,
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
	store: new MongoStore({
		// db: settings.db
		url: 'mongodb://localhost/blog'
	})
}))

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err, req, res, next) {
	var meta = '[' + new Date() + ']' + req.url + '\n';
	errorLog.write(meta + err.stack + '\n');
})

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);
