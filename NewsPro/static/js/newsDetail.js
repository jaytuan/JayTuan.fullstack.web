$(document).ready(function(){
	pageInit();
	
});
var baseData = {
	newsInforOrigin:[],
	newsId:[],
	thisNews:{},
	newsType:[],
	newsCom:[],
}
var pageHandler = {
	bindPageEvent:function(){

	},
	//绑定导航栏切换
	bindNavEvent:function(){
		$('.news_head .new_type').on('click',function(){
			$('.news_head .new_type.selected').removeClass('selected');
			$(this).addClass('selected');
			window.location.href = '/pages/newsList.html?type=' + encodeURIComponent($(this).attr('_classifyName'));
		});
	},
	msgwin:function(obj){
		//OBJ{title,content,btns[{"btnName":'',"btnClassName":'',_callback:"回调函数"},{"btnname":'',"btnClassName":'',_callback:"回调函数"}],回调函数与btn顺序对应}不传btns默认btn只一个
		//title不传的话默认温馨提示
		if(typeof(obj)=='object'){
			var msgTxt = doT.template($("#popWin").html());
            $(".pop_Msg").html(msgTxt(obj));
            $(".pop_Msg").removeClass('none');
			$('.pop_Msg .closeBtn').on('click',function(){
	            $(".pop_Msg").addClass('none');
			});
            if(obj.btns&&obj.btns.length){
            	for(var i = 0;i<obj.btns.length;i++){
            		var btn = obj.btns[i];
            		$('.'+btn.btnClassName).on('click',btn._callback);
            	}
            }else{
        		$('.known').on('click',function(){
        			$('.pop_Msg .closeBtn').click();
        		});
            }
		}
	},
	//获取url中的参数
    getUrlParam:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    }
}
var getDataHandler = {
	getNewsInfoList:function(){
		$.ajax({
			url:'/getNewsInfoList.ashx',
			type:'get',
			dataType:'jsonp',
			jsonpCallback:"success_jsonpCallback",
			success:function(data){
				if(data.status == 200 && data.data && data.data.length > 0){
					baseData.newsInforOrigin = data.data;
					for (var i = 0;  i < baseData.newsInforOrigin.length ; i++) {
						var news = baseData.newsInforOrigin[i];
						if(news.ID == baseData.newsId){
							var cteateTime = new Date(news.CreateTime*1)
							var timeStr = '';
							timeStr += cteateTime.getFullYear()+'年';
							timeStr += (cteateTime.getMonth() + 1 )+'月';
							timeStr += cteateTime.getDate()+'日 ';
							timeStr += cteateTime.getHours()+':';
							timeStr += cteateTime.getMinutes() > 9 ? cteateTime.getMinutes() : ('0'+cteateTime.getMinutes());
							news.timeStr = timeStr;
							for(var j=0;j<baseData.newsCom.length;j++){
								var company = baseData.newsCom[j];
								if(news.CompanyID == company.ID){
									news.companyName = company.CoName;
									news.companyTel = company.CoTelPhone;
									news.CoAddr = company.CoAddr;
								}
							}
							baseData.thisNews = news;
							break;
						}
					};	
					console.log(baseData.thisNews );
					var thisNewsTxt = doT.template($('#thisNews').html());
					$('.news_content').html(thisNewsTxt(baseData.thisNews));	
				}else{
					pageHandler.msgwin({
					Content:'网络故障，请稍后再试',
					btns:[
							{
								"btnName":'好的',
								"btnClassName":'OK',
								"_callback":function(){
									$('.pop_Msg .closeBtn').click();
								}
							}
						]
				});
				}
			},
			error:function(err){
				pageHandler.msgwin({
					Content:'网络故障，请稍后再试',
					btns:[
							{
								"btnName":'好的',
								"btnClassName":'OK',
								"_callback":function(){
									$('.pop_Msg .closeBtn').click();
								}
							}
						]
				});
			},
		});		
	},
	getNewsType:function(){
		$.ajax({
			url:'/getNewsType.ashx',
			dataType:'jsonp',
			jsonpCallback:"success_jsonpCallback",
			success:function(backData){
				if(backData.data.length){
					baseData.newsType = backData.data[0];
					baseData.newsCom = backData.data[1];
					getDataHandler.getNewsInfoList();
					 var newsTypeTxt = doT.template($("#newsTypeList").html());
                     $(".news_head .news_type").html(newsTypeTxt(backData.data[0]));
                     pageHandler.bindNavEvent();
				}
			},
			error:function(backData){
				console.log(backData);
			},
		});
	}
}
var pageInit = function(){
		baseData.newsId = pageHandler.getUrlParam('id');
		getDataHandler.getNewsType();
};
