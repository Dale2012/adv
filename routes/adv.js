
/*
 * GET home page.
 */
var fs = require('fs')
    ,mysql = require('./../utils/mysql')
    ,encoding = require("encoding")
    ,buffer=require('buffer')
    ,iconv=require('iconv-lite')    ,
    http=require('http')
    , path = require('path');


exports.show = function(req, res){
    var secret_key = req.get('secret_key');

    console.info("secret_key:"+secret_key);
    if ('ijoyplus_android_0001' == secret_key) {
        var app_id = req.param('app_id');
        console.info("app_id:"+app_id);
        var mac = req.param('mac');
        console.info("mac:"+mac);
        var device_num = req.param('device_num');
        console.info("device_num:"+device_num);
        var adv_type = req.param('adv_type');
        if(adv_type ==undefined || adv_type ==''){
            adv_type='video';
        }
        console.info("adv_type:"+adv_type);
        var adv_client_id = req.param('adv_client_id');
        console.info("adv_client_id:"+adv_client_id);
        var ip = req.get('x-forwarded-for')||req.connection.remoteAddress;
        console.info("ip:"+ip);
        var agent = req.get('user-agent');
        console.info("user-agent:"+agent);
        var device_type='';

        if(adv_type ==='img'){
           var adv_id='2010018345';
            var random =randomNumber(4);
            if(random%2 ==1){
                var url='http://advresource.joyplus.tv/image/image033000001.jpg';
            }else {
                var url='http://advresource.joyplus.tv/image/image133000005.jpg';
            }
        }else {
            var adv_id='2010018346';
            var url='http://advresource.joyplus.tv/video/video123000005.flv';
        }

        getIpArea(ip,function(area){
            mysql.execute("insert into md_adv_request_log(app_id, mac, device_num, adv_type, adv_client_id, adv_id, user_agent, " +
                "request_date, request_ip, request_area, device_type)" +
                " values(?,?,?,?,?,?,?,?,?,?,?)",[app_id, mac, device_num, adv_type, adv_client_id, adv_id, agent, new Date(), ip, area, device_type],
                function(id){
                    console.log(id)       ;
                });
        })  ;
        if(adv_type ==='img'){
            res.json({
                "type":'img',
                "title":'',
                "summary":'',
                "adv_id":adv_id,
                "url":url});
        }else{
            res.json({
                "type":'video',
                "adv_id":adv_id,
                "title":'',
                "summary":'',
                "url":url});

        }
    }else {
        res.json({"res_code":"10006","res_desc":"Source paramter (appkey) is missing or invalid"});
    }
};
var IP_URL='http://www.ip138.com/ips1388.asp?ip={IP}&action=2';

function getIpArea(ip,callback){
    var url = IP_URL.replace("{IP}",ip);
    console.info("url:"+url);
    getPage(url,'gb2312',function(content){
          //console.info(content);
          var area = getBody(content, '<li>本站主数据：', ' ');
        if(area.indexOf('保留地址') >-1){
              area='';
        }
        console.info(ip+" 所在地区： "+area);
        callback(area);
    }) ;


}

function getBody(body,startStr,endStr){
    if(body == undefined || body ==''){
        return false;
    }
    if(startStr == undefined || startStr ==''){
        return false;
    }
    if(endStr == undefined || endStr ==''){
        return false;
    }
    if(body.indexOf(startStr) !=-1) {
//         console.log(body.indexOf(startStr));
        var str = body.substr(body.indexOf(startStr) + startStr.length)   ;
//         console.log(str.indexOf(endStr));
        str = str.substring(0,str.indexOf(endStr));
        return str;
    }
    return false;
}

function getPage(url,charset,callback){
    var html = '';
    http.globalAgent='Mozilla/5.0 (iPad; U; CPU OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5';
    var req =http.get(url, function (res) {
        res.setEncoding('binary');//or hex
        res.on('data',function (data) {//加载数据,一般会执行多次
            html += data;
        }).on('end', function () {
                var buf=new Buffer(html,'binary');//这一步不可省略
                var tempCharset = getBody(html,'charset=','"');
                console.log(tempCharset);
                if(tempCharset){
                    var str=iconv.decode(buf, tempCharset);//将GBK编码的字符转换成utf8的
                } else {
                    var str=iconv.decode(buf, charset);//将GBK编码的字符转换成utf8的
                }
               callback(str);
            })
    }).on('error', function(err) {
            console.log("http get error:",err);
            callback(false);
        });
};
function randomNumber(input){
    var numInput = new Number(input);
    var numOutput = new Number(Math.random() * numInput).toFixed(0);
    return numOutput;
}


getPage('http://www.letv.com/ptv/pplay/88621/22.html','',function(content){
     console.info(content);
})  ;
