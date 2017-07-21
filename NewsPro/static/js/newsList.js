var baseData = {
	newsInforOrigin:[],
	inuseNews:[],
	newsType:[],
	newsCom:[],
	BannerData:[],
	needRenderData:[],
	nowType:'',
}
var pageHandler = {
	bindPageEvent:function(){
		$('.search_btn').on('click',function(){
			var keyWord = $('.search_keyword').val().trim();
			if(keyWord){
				$.ajax({
					url:'/searchNews.ashx?keyword='+encodeURIComponent(keyWord),
					dataType:'jsonp',
					jsonpCallback:"success_jsonpCallback",
					success:function(backData){
						var newsArrData = [{},{}];
						if(backData.data.length){
							for (var i = 0;  i < backData.data.length ; i++) {
								var news = backData.data[i];
								var cteateTime = new Date(news.CreateTime*1)
								var timeStr = '';
								timeStr += cteateTime.getFullYear()+'.';
								timeStr += (cteateTime.getMonth() + 1 )+'.';
								timeStr += cteateTime.getDate()+' ';
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
								//新闻有效且审核通过时方可显示给用户
								if(news.IsInUse == 1 && news.NewsStatus == 2){
									newsArrData.push(news);
								}
							};	
							baseData.needRenderData = newsArrData;
							$('.news_content .banner').addClass('none');
							$('.news_content .top_line').addClass('none');
							pageHandler.renderList();
						}else{
							$('.null_search_result').removeClass('none');
							$('.news_content').addClass('none');
							$('.footer').addClass('none');
						}
					},
					error:function(){
							$('.null_search_result').removeClass('none');
							$('.news_content').addClass('none');
							$('.footer').addClass('none');
					}
				})
			}
		});
	},
	//获取url中的参数
    getUrlParam:function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var decodeUrl = decodeURIComponent(window.location.search.substr(1));
        var r = decodeUrl.match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    },
	//渲染列表 index为页码，needRenderTop为需不需要渲染头条
	renderList:function(index,needRenderTop){
		if(!index){
			index = 1;
		}
		if(needRenderTop){
			//头条从所有数据中截取前两条展示
			var topNews = baseData.needRenderData.slice(0,2);
			var topLineTxt = doT.template($('#topLines').html());
			$('.top_line_news').html(topLineTxt(topNews));
		}
		var showNews = baseData.needRenderData.slice((index-1)*10+2,index*10+2);;
		var newsListTxt = doT.template($('#listTemp').html());
		$('.newslist').html(newsListTxt(showNews));
		pageHandler.renderPages(index);
		$('.news_content').removeClass('none');
		$('.footer').removeClass('none');
		$('.null_search_result').addClass('none');
	},
	//渲染分页,计算总页数时去掉头条的两条
	renderPages:function(nowIndex){
		var totalIndex = Math.ceil((baseData.needRenderData.length-2)/10);
		var data = {
			total:totalIndex,
			now: nowIndex,
		}
		var fenyeTxt = doT.template($('#fenye').html());
		$('.footer').html(fenyeTxt(data));
	},
	renderBanner:function(){
		var bannerTxt = doT.template($('#bannerTemp').html());
		$('.banner .banner_ul').html(bannerTxt(baseData.BannerData));
		pageHandler.startBanner(baseData.BannerData.length);
	},
	startBanner:function(len){
		var i = 1;
		setInterval(function(){
			// var nextShowElem =  $('.banner .banner_ul li:not(.none)').next();
			// $('.banner .banner_ul li:not(.none)').addClass('none');
			// $(nextShowElem).removeClass('none');
			if(i< len ){
				i++;
				$('.banner .banner_ul li:not(.none)').addClass('none').next().removeClass('none');
			}else{
				i=1;
				$('.banner .banner_ul li:first').removeClass('none');
				$('.banner .banner_ul li:last').addClass('none');
			}
		},5000);
		$('.banner .banner_ul li').on('click',function(){
			window.location.href = '/pages/newsDetail.html?id='+$(this).attr('_id');
		});
	},
	//绑定导航栏切换
	bindNavEvent:function(){
		$('.news_head .new_type').on('click',function(){
			$('.news_head .new_type.selected').removeClass('selected');
			$(this).addClass('selected');
			getDataHandler.filterNews($(this).attr('_classifyName'));
			$('.news_content .banner').removeClass('none');
			$('.news_content .top_line').removeClass('none');
			$('.search_keyword').val('');
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
					baseData.newsInforOrigin.sort(function(a,b){
						return b.CreateTime - a.CreateTime;
					});

					for (var i = 0;  i < baseData.newsInforOrigin.length ; i++) {
						var news = baseData.newsInforOrigin[i];
						var cteateTime = new Date(news.CreateTime*1)
						var timeStr = '';
						timeStr += cteateTime.getFullYear()+'.';
						timeStr += (cteateTime.getMonth() + 1 )+'.';
						timeStr += cteateTime.getDate()+' ';
						timeStr += cteateTime.getHours()+':';
						timeStr += cteateTime.getMinutes() > 9 ? cteateTime.getMinutes() : ('0'+cteateTime.getMinutes());
						news.timeStr = timeStr;
						if(news.NewsTitle.length>30){
							news.NewsShortTitle = news.NewsTitle.slice(0,30)+'...';
						}
						for(var j=0;j<baseData.newsCom.length;j++){
							var company = baseData.newsCom[j];
							if(news.CompanyID == company.ID){
								news.companyName = company.CoName;
								news.companyTel = company.CoTelPhone;
								news.CoAddr = company.CoAddr;
							}
						}
						if(news.HotImg){
							baseData.BannerData.push(news);
						}
						//新闻有效且审核通过时方可显示给用户
						if(news.IsInUse == 1 && news.NewsStatus == 2){
							baseData.inuseNews.push(news);
						}
					};		
					baseData.needRenderData = baseData.inuseNews;		
					pageHandler.renderList(1,true);
					pageHandler.renderBanner();
			        if(baseData.nowType != '首页'){
				        $('.new_type[_classifyName='+baseData.nowType+']').click();
			        }
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
	//过滤新闻选项 type为选中的新闻类别
	filterNews:function(type){
		if(type){
			var filtered =[];
			var news={};
			for(var i=0;i<baseData.inuseNews.length;i++){
				news = baseData.inuseNews[i];
				if(news.NewsType == type){
					filtered.push(news);
				}
			}
			baseData.needRenderData = filtered;
		}else{
			baseData.needRenderData = baseData.inuseNews;
		}
		pageHandler.renderList(1,true);
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
		getDataHandler.getNewsType();
		baseData.nowType = pageHandler.getUrlParam('type');
		pageHandler.bindPageEvent();
};
$(document).ready(function(){
	pageInit();
});