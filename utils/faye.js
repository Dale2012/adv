/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-5-7
 * Time: 上午10:36
 * To change this template use File | Settings | File Templates.
 */

var redisUtils = require('./redis')
    , faye = require('faye');


var bayeux     = new faye.NodeAdapter({mount: '/uploadApk', timeout: 20});

exports.attach = function(server){
    bayeux.attach(server);
    bayeux.bind('subscribe', function(clientId, channel) {
        console.log('[  SUBSCRIBE] ' + clientId + ' -> ' + channel);
    });

    bayeux.bind('unsubscribe', function(clientId, channel) {
        console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
    });

    bayeux.bind('disconnect', function(clientId) {
        console.log('[ DISCONNECT] ' + clientId);
    });
}

exports.bind=function(event,callback){
    bayeux.bind(event,callback);
}

exports.subscribe=function(path,callback){
    bayeux.getClient().subscribe(path,callback);
}

exports.publish=function(path,msg,callback){
    console.info("path: "+path + " msg: "+msg);
    var publication=bayeux.getClient().publish(path, msg);
    publication.callback(function() {
        console.info('Message received by server!');
        callback('ok');
    });

    publication.errback(function(error) {
        console.info('There was a problem: ' + error.message);
        callback('fail:' +error.message);
    });

}
