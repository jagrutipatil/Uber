
/**
 * Module dependencies.
 */

var sessions = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var routes = require('./routes');
var customer = require('./routes/customerClient');
var driver = require('./routes/driverClient');
var delegator = require('./routes/delegatorClient');
var bill = require('./routes/billingClient');
var rides = require('./routes/ridesClient');
var multer = require('multer');
var http = require('http');
var path = require('path');
var amqp = require('amqp');
var session = require('./routes/session');
var administrator = require('./routes/administratorClient')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(sessions({
    cookieName: 'ubersession',
    secret: 'codeishere',
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5 
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/delete_customer', delegator.delete_customer );
app.get('/delete_driver', delegator.delete_driver );

app.get('/logout', function (req, res) {
	  console.log('logout');
	  req.ubersession.reset();
	  res.redirect('/');
});


app.get('/:name', rides.partials);

app.get('/admin', delegator.admin);
app.get('/', delegator.home);
app.get('/loginPage', delegator.loginPage);
app.get('/loginCustomer', delegator.loginCustomer);
app.get('/signupCustomer', delegator.signupCustomer);
app.get('/loginDriver', delegator.loginDriver);
app.get('/signupDriver', delegator.signupDriver);
app.get('/updateDriver', session.isAuthDriver, delegator.updateDriver);
app.get('/updateCustomer', session.isAuthUser, delegator.updateCustomer);
app.get('/customerProfile', session.isAuthUser, delegator.updateCustomer);
app.get('/customerPayment', session.isAuthUser, delegator.updatePaymentCustomer);
app.get('/customerDashboard', session.isAuthUser, delegator.customerDashboard);

app.get('/driverDashboard', session.isAuthDriver, delegator.driverDashboard);
app.get('/admin', delegator.admin);
app.get('/', delegator.home);
app.get('/RequestRide', delegator.requestRide);
app.get('/loginPage', delegator.loginPage);
app.get('/loginCustomer', session.skipAuthUser, delegator.loginCustomer);
app.get('/signupCustomer', session.skipAuthUser, delegator.signupCustomer);
app.get('/loginDriver', session.skipAuthDriver, delegator.loginDriver);
app.get('/signupDriver', session.skipAuthDriver, delegator.signupDriver);

app.get('/index',function(req, res){
	  res.render('index', { title: 'Express' });
});
app.get('/index2',function(req, res){
	  res.render('index2', { title: 'Express' });
});


app.get('/driverRides',function(req, res){
	  res.render('DriverRides', { title: 'Express' });
});

app.post('/session_get_ssn', session.ssn);

app.post('/bk_customer_signin', customer.signin);
app.post('/bk_customer_signup', customer.signup);
app.post('/bk_customer_remove_with_email', customer.remove_with_email);
app.post('/bk_customer_remove_with_ssn', customer.remove_with_ssn);
app.post('/bk_customer_selectAll', customer.selectAll);
app.post('/bk_customer_selectAllUnApproved', customer.selectAllUnApproved);
app.post('/bk_customer_search_with_name', customer.search_with_name);
app.post('/bk_customer_search_with_ssn', customer.search_with_ssn);
app.post('/bk_customer_search_with_email', customer.search_with_email);
app.post('/bk_customer_update', customer.update);
app.post('/bk_customer_updateLatLng', customer.updateLatLng);
app.post('/bk_customer_updatePayment', customer.updatePayment);
app.post('/bk_customer_approve', customer.approve);
app.post('/bk_customer_rating', customer.rating);

app.post('/bk_driver_signin', driver.signin);
app.post('/bk_driver_signup', driver.signup);
app.post('/bk_driver_remove_with_email', driver.remove_with_email);
app.post('/bk_driver_remove_with_ssn', driver.remove_with_ssn);
app.post('/bk_driver_selectAll', driver.selectAll);
app.post('/bk_driver_selectAllUnApproved', driver.selectAllUnApproved);
app.post('/bk_driver_selectAllAvailable', driver.selectAllAvailable);
app.post('/bk_driver_search_with_name', driver.search_with_name);
app.post('/bk_driver_search_with_ssn', driver.search_with_ssn);
app.post('/bk_driver_update', driver.update);
app.post('/bk_driver_updateLatLng', driver.updateLatLng);
app.post('/bk_driver_approve', driver.approve);
app.post('/bk_driver_rating', driver.rating);


app.post('/bk_admin_reviewDriver', administrator.reviewDriver);
app.post('/bk_admin_reviewCustomer', administrator.reviewCustomer);
app.post('/bk_admin_searchbill_by_driverid',administrator.searchbill_by_driverid);
app.post('/bk_admin_searchbill_by_customerid', administrator.searchbill_by_customerid);
app.post('/bk_admin_searchbill_by_billid', administrator.searchbill_by_billid);
app.post('/bk_admin_searchbill_by_date', administrator.searchbill_by_date);
app.post('/bk_admin_rides_perdriver', administrator.rides_perdriver);
app.post('/bk_admin_rides_percustomer', administrator.rides_percustomer);
app.post('/bk_admin_rides_perpickuplocation', administrator.rides_perpickuplocation);
app.post('/bk_admin_rides_perdropofflocation', administrator.rides_perdropofflocation);
app.post('/bk_admin_revenueperday', administrator.revenueperday);
app.post('/bk_admin_deletebill_billId',administrator.deletebill_billId);

//rides
app.post('/bk_rides_register', rides.register);

//billing module
app.post('/billGenerate', bill.billGenerate);
app.post('/estimate', bill.estimate);
app.post('/getUserBills', bill.getUserBills);
app.post('/getBill', bill.getBill);

//app.post('/getDriverSummary', rides.getDriverSummary);

//Images
app.get('/addImagesToRide', session.isAuthDriver, customer.renderAddImagesToRide);
app.post('/addImagesToRide', customer.addImagesToRide);
app.get('/getImagesOfRide', session.isAuthDriver, customer.getImagesOfRide);
app.get('/getImage', session.isAuthDriver, customer.getImage);


var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function (socket) {
	var count = 0;
	socket.broadcast.emit('news', { hello: 'world' });
	socket.on('Server', function (data) {
		console.log(data);
	  if(data.request == 'Start Ride'){
		  socket.broadcast.emit('Driver', data);
	  } else if(data.request == 'Ride Accepted'){
		  socket.broadcast.emit('Customer', data);
	  }	 else if(data.request == 'Ride Ended'){
		  socket.broadcast.emit('Customer', data);
	  }	      
	});
	
});
/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/