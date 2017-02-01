/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-4-25
 * Time: 下午4:53
 * To change this template use File | Settings | File Templates.
 */
var mysql_options = {
    'host':'localhost',
    'port':3306,
    'database':'ijoyplus',
    'charset':'utf-8',
    'debug':true,
    'user':'joyplus',
    'password':'ilovetv001'
};
var sys = require('util'),
    connection = require('mysql').createConnection(
        mysql_options);

// 返回连接
exports.conn = function(){
    var tempConn=          mysql.createConnection(mysql_options);
    tempConn.query(
        'SET NAMES utf8',
        function(err, results, fields) {
            if (err) {
                throw err;
            }

          //  console.log(results);
            connection.end();
        }
    );
        return tempConn;
};
// 自定义db
exports.conndb = function(db){
    if(db) mysql_options['database'] = db;
    var tempConn=          mysql.createConnection(mysql_options);
    tempConn.query(
        'SET NAMES utf8',
        function(err, results, fields) {
            if (err) {
                throw err;
            }

            //console.log(results);
            connection.end();
        }
    );
    return tempConn;
};

connection.query(
    'SET NAMES utf8',
    function(err, results, fields) {
        if (err) {
            throw err;
        }
    }
);

exports.select = function(sql,callback){
    connection.query(
        sql,
        function selectCb(error, results, fields) {
            console.info("sql: "+sql );
            if (error) {
                console.log('GetData Error: ' + error.message);
                callback(false);
            }else {
                callback(results);
            }
         });
    console.log('Connection closed');
}

exports.execute = function(sql,values,callback){
    connection.query(sql, values,
        	    function(error, results) {
                  console.info("sql: "+sql +" values:"+values);
        	      if(error) {
            	      console.log("ClientReady Error: " + error.message);
                      callback(false);
           	      }
        	      console.log('Id inserted: ' + results.insertId);
                  callback( results.insertId);
        	    }
    	  );
}




