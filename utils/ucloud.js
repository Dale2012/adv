/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-5-7
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */



var faye = require('./faye')
    , path = require('path')
    ,mysql = require('./mysql');

exports.updateApk=function(info,callback){
    console.info(info);
    var file_key =info['file_key'];
    var file_name =info['file_name'];
    var file_size =info['file_size'];
    var file_type =info['file_type'];
    var pinCode =info['pinCode'];
    var url =info['url'];
    var fileMD5 =info['fileMD5'];
    var package =info['package'];
    var versionCode =info['versionCode'];
    var versionName =info['versionName'];
    var minSdkVersion  =info['minSdkVersion'];
    var appName  =info['appName'];
    var targetSdkVersion =info['targetSdkVersion'];
    var dbFileUrl=false;
    mysql.select("select id, file_url,apk_id from apk_master_items where version_code='"+versionCode+"' and version_name='"+versionName+"' and package_name='"+package+"'" +
        " and md5='"+fileMD5+"'",function(result){
        console.info("result apk_master_items length : "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            dbFileUrl=firstResult['file_url'];
            this.sendMsg(dbFileUrl,pinCode,file_key,function(msg){
                      console.info("updateApk sendMsg: "+msg);
                      callback(msg);
            })  ;
            //increase
            mysql.execute("update apk_master_items set upload_count=upload_count+1 where id=?",[firstResult['id']],function(msg){
                  // console.info();
            })  ;
            mysql.execute("update apk_master_base set upload_count=upload_count+1 where id=?",[firstResult['apk_id']],function(msg){

            })  ;

        }else {
            mysql.select("select id,file_url from apk_master_temp where version_code='"+versionCode+"' and version_name='"+versionName+"' and package_name='"+package+"'" +
                " and md5='"+fileMD5+"'",function(result){
                console.info("result length: "+result.length );
                if(result.length > 0)  {
                    var firstResult = result[0];
                    dbFileUrl=firstResult['file_url'];
                    this.sendMsg(dbFileUrl,pinCode,file_key,function(msg){
                        console.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;
                    mysql.execute("update apk_master_temp set upload_count=upload_count+1 where id=?",[firstResult['id']],function(msg){
                        // console.info();
                    })  ;
                } else {
                    this.sendMsg(url,pinCode,false,function(msg){
                        console.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;
                    mysql.execute("insert into apk_master_temp(package_name,upload_count,file_url,file_type,qiniu_file_key,file_size,md5," +
                        "version_code,version_name,min_sdk_version,target_sdk_version,file_name,create_date,app_name)" +
                        " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[package,'1',url,file_type,file_key,file_size,fileMD5,versionCode,versionName,minSdkVersion,targetSdkVersion,file_name,new Date(),appName],
                        function(id){
                        console.log(id)       ;

                    });
                }
            });

        }
    });

}

sendMsg=function(fileUrl,pincode,file_key,callback){
     console.info("url:"+fileUrl + " pincode:"+pincode +" filekey :"+file_key);
    if(file_key){
        qiniu.remove(file_key,function(msg){
             console.info(msg);
        })  ;
    }

    redisUtils.get(pincode, function (err, reply) {
        console.info("err:" +err +" reply:"+reply);
        if (!err) {
            if (reply != null) {
               faye.publish("/"+reply,{text:fileUrl},function(msg){
                    console.info(msg);
                   callback('ok')  ;
               });
            }else {
                callback('fail')  ;
            }
        }else {
             callback('fail')  ;
        }

    });
}

exports.generatePinCode=function(mac_address,client,callback){
    //delete mac_address related record
    mysql.select("select pin_code from apk_device where device_mac_address='"+mac_address+"'",function(result){
        console.info("result length: "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            var oldPinCode=  firstResult['pin_code'];
            console.log("old pin code: "+oldPinCode);
            //delete old pin code in redis
            redisUtils.del(oldPinCode, function (err, reply) {
                console.log(reply.toString());
            });
        }
        mysql.execute("delete from apk_device where device_mac_address=?",[mac_address],function(msg){
            genPinCode(client,mac_address,function(pinCode){
                //set pin code
                redisUtils.set(pinCode, PIN_CODE_CHANNEL_PREFIX+pinCode, function (err, reply) {
                    console.log(reply.toString());
                });
                callback(pinCode,PIN_CODE_CHANNEL_PREFIX+pinCode);
            });

        })  ;
    });
}
var PIN_CODE_CHANNEL_PREFIX='SHOW_UCLOUD_CHANNEL_';

function genPinCode(client,mac_address,callback){
    var pinCode= randomCode(6);
    console.info(pinCode);
    mysql.select("select id from apk_device where pin_code='"+pinCode+"'",function(result){
        console.info("result length: "+result.length );
        if(result.length > 0)  {
            genPinCode(client,mac_address,callback);
        }else {
            mysql.execute("insert into apk_device(device_name,device_mac_address,pin_code,channel_name)" +
                " values(?,?,?,?)",[client,mac_address,pinCode,PIN_CODE_CHANNEL_PREFIX+pinCode],
                function(id){
                    console.log(id) ;
                    callback( pinCode);
                });

        }
        }
     );
}

function randomCode(length){
    var cap='abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba';
    var num='01234567899876543210';
    var code='';
    for(var i=0;i<length;i++){
        var randomInt= randomNumber(length*37+1);
        var tempCode='';
        var tempLength=0;
        if(randomInt%2 ==0) {
            tempCode =cap;
            tempLength=52;
        }  else {
            tempCode =num;
            tempLength=20;
        }

        var random= randomNumber(tempLength);
        if(random ==0 ) {
            code+=tempCode.substr(0,1);
        }else if(random ==tempLength ) {
            code+=tempCode.substr((tempLength-1),1);
        } else {
            code+=tempCode.substr(random,1);
        }

    }
    return code;
}

function randomNumber(input){
    var numInput = new Number(input);
    var numOutput = new Number(Math.random() * numInput).toFixed(0);
    return numOutput;
}

