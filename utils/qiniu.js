/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-4-28
 * Time: 下午4:15
 * To change this template use File | Settings | File Templates.
 */

var qiniu = require("qiniu")
    , redisUtils = require('./redis');

qiniu.conf.ACCESS_KEY = 'KxWtcZj-oCvdN4WV2yZJyRZwcGcbPZfHhseFJV7T';
qiniu.conf.SECRET_KEY = 'wv8QEM5FmAc4yCu256uYkIRiv8LM7WNJpIOY8szy';
var conn = new qiniu.digestauth.Client();
var bucket = "apk2";
// 实例化 Bucket 操作对象
var rs = new qiniu.rs.Service(conn, bucket);

/*  建立空间space
 qiniu.rs.mkbucket(conn, bucket, function(resp) {
 console.log("\n===> Make bucket result: ", resp);
 if (resp.code != 200) {
 return;
 }
 });    */

var options = {
    scope: bucket,
    expires: 100000
};

var REDIS_KEY_QI_NIU_TOKEN='REDIS_KEY_QI_NIU_TOKEN'+"_"+bucket;

exports.getToken= function (callback){
    redisUtils.getExpired(REDIS_KEY_QI_NIU_TOKEN, function (err, reply) {  reply=null;
          if (err !=null || reply==null ) {
           console.info("Token can't find it");
            var uploadPolicy = new qiniu.auth.PutPolicy(options);
            var uploadToken = uploadPolicy.token();
            var token = uploadToken.toString();
            redisUtils.setExpired(REDIS_KEY_QI_NIU_TOKEN,100000, token, function (err, reply) {
                console.info("set Token suc: "+reply.toString());
            });
            callback(token,bucket);
        } else {
            console.info("QiNiu token: "+reply);
            callback(reply,bucket);
        }

    });
}


exports.remove= function (key,callback){
    rs.remove(key, function(resp) {
        console.log("\n===> remove result: ", resp);
        if (resp.code != 200) {
            callback(key+' remove fail');
        } else {
            callback(key+' remove succ');
        }
    });
}

