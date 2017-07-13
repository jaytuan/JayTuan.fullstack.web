var http = require('http');
var url = require('url');
var querystring = require('querystring');
function start(route){
	var onRequest = function(request,response){
	    console.log("Request for " + request.url + " received.");
	    //获取文件后缀名
	    route(request.url,function(content){
		    var postfix = url.parse(request.url).pathname.split('.')[1];
	    	var fileType = checkFilePostfix(postfix);
			console.log(!content ? 'request fail':'request success');
			response.writeHead(!content ? 404 : 200,{"Content-Type": fileType + ";charset=utf-8"});
			if(postfix == 'ashx'){
			    response.write("success_jsonpCallback("+content+")");
		    }else{
			    response.write(content);
		    }
	    	response.end();
	    });
		
	};
	//此方法待删除
	var checkFilePostfix = function(postfix){
			switch(postfix){
				case "html" : 
					return "text/html";
					break;
				case "js" : 
					return "text/javascript";
					break;
				case "css" : 
					return "text/css";
					break;
				case "ashx":
				 	return "application/jsonp";
				 	break;
				default :
					return "text/html";
					break;
			};
	};
	http.createServer(onRequest).listen(80);
	console.log('Server running at http://123.206.128.221:80//');
}
exports.start = start;
