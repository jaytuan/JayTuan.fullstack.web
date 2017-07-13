var fs = require('fs');
var url = require('url');
var util = require('util');
var requesthandler = require('./requestHandlers');
function route(reqUrl,callback){
	if(reqUrl=='/'){
		reqUrl = '/pages/backLogin.html';
	}
	var pathname = url.parse(reqUrl).pathname;
    var postfix = pathname.split('.')[1];
    // if(!!postfix){
        if(postfix != "ashx"){
				//非接口请求
			var data = fs.readFileSync(pathname.substr(1));
			if(data){
				console.log("readFile "+pathname.substr(1)+"success");
				callback(data);
			}else{
				console.log("data false");
				callback(false);
			}
		}else{
			//接口
			var paths = pathname.split('/');
			var interfaceName = paths[paths.length-1].split('.')[0];
			//params 为参数对象
			var params = url.parse(reqUrl,true).query;
			switch(interfaceName){
				//获取新闻listdata渲染list
				case 'getNewsInfoList':
					requesthandler.getNewsInfo(params,callback);
					break;
				case 'loginSys':
					requesthandler.loginSystem(params,callback);
					break;
				case 'getNewsType':
					requesthandler.getNewsType(params,callback);
					break;
				case 'addNews':
					requesthandler.addNews(params,callback);
					break;
				case 'updateNewsInfor':
					requesthandler.updateNewsInfor(params,callback);
					break;
				case 'multimeout':
					requesthandler.multimeout(params,callback);
					break;
				case 'delNews':
					requesthandler.delNews(params,callback);
					break;
				case 'searchNews':
					requesthandler.searchNews(params,callback);
					break;
				case 'mulapprove':
					requesthandler.mulapprove(params,callback);
					break;
			}
		} 
	// }else{
	// }
} 
exports.route = route;


