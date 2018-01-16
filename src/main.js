var filepath = location.host.indexOf('boss')>0?'http://www.500boss.com/static/':'http://www.500.com/static/' ;
var appCommonent =  {     //所有组件公用的项目
    data:function () {
        return {
            inited:false,
            total:1,  //列表公用元素
            size:10,
            start:this.getTime(new Date() -  7 * 24 * 3600 * 1000),
            end:this.getTime(),
            list:[],
            page:1,

            userinfo:'',
            searchuser:'username',
            searchtype:{'username':'用户名',/*'nickname':'昵称','idcardname':'真实姓名'*/},

            msg:{type:1,show:false,callback:null},
            tip:{type:'',content:'',show:false},
            alert:{type:'',content:'',show:false,callback:null},

            username:'',
        }
    },
    methods:{
        getJson:function (param,callback) {
            $.get('api/main.php',param,function(data){
                    if(data==-100){ //用户未登录
                        this.alert = {type:'confirm',content:'请登录',show:true,callback:function (confirm) {
                            if(confirm) location.href = 'http://' + location.host + '/login/login.php';
                        }.bind(this)}
                    }else if(data.code == '-1000'){
                        this.alert = {type:'confirm',content:data.msg,show:true}
                    }else{
                        callback(data);
                    }
                }.bind(this),'json');
        },
        pagechangeCallback:function (n) { //每个实例里面都要写 封装不是太好。以后探讨别的使用方法
            this.page = n; //切换页面功能
            this.search();
        },
        setSearchParam:function () {
            var param = this.$route.params.search.split('_');
            for(var i=0;i<param.length;i+=2){
                this[param[i]] = param[i+1];
            }
            if(this.start==''){
                var start = new Date();
                start.setDate(1);
                this.start= start.formatDate('yyyy-MM-dd');
            }
            if(this.end==''){
                var end =  new Date();
                this.end= end.formatDate('yyyy-MM-dd');
            }
        },
        sum:function (property) {
            var s = 0;
            for(var i=0;i<arguments.length;i++){
                property = arguments[i];
                if(this.list)this.list.forEach(function (v) {
                    if(v[property]) s = s + parseFloat(v[property]);
                });
            }
            return s;
        },
        getTime:function (date) {
            var time;
            if(!date){
                time = new Date();
            }else{
                time = new Date(date);
            }
            var year = time.getFullYear(),
                month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1,
                d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();

            return year + '-' + month + '-' + d;
        }
    },
    watch:{ //监听数据变化
        $route:function (n,v) { // 监听hash变化获取和重置数据
            console.log(this.$route.params.search);
            if(this.$route.params.search){  //列表
                this.setSearchParam();
                this.getList();
            }
            if(this.$route.params.id){
                this.id = this.$route.params.id;
            }
            if(this.$route.params.username){
                this.username = this.$route.params.username;
            }
        }
    },
}
//实例 专家审核列表页面
var expertlistView = Vue.exten d({
    mixins:[appCommonent],
    template:'#expertlist',
    mounted:function () {  //挂载初始化
        this.setSearchParam();
        this.getList();
    },
    data:function () {
        return {
            status:0, // 0 未审核 -1 未通过 1 已通过
            currentRow:{},
            currentStatus:0,
            showStatus:false,
            sortType: false,
            sortMod: '',
            skills: '',
            input:{
                title: '',
                content: '',
                show: false,
                callback:function () {}
            },
            userRefresh: false
        }
    },
    methods: {
        search:function () {
            var sortType = this.sortType ? 'asc' : 'desc';
            var param = ['status',this.status,'page',this.page,'sortmod',this.sortMod,'sorttype',sortType];
            location.hash = '/expertlist/'+param.join('_');
            this.userRefresh = false;
        },
        getList:function () {
            this.getJson({mod:'expertlist',page:this.page,size:this.size,status:this.status,sortmod:this.sortMod,sorttype:this.sortType ? 'asc': 'desc'},function (data) {
                this.total = Math.ceil(data.total/this.size);
                this.list = data.list;
                this.inited = true;
            }.bind(this));
        },
        check:function (row,t) {
            this.currentRow = row;
            this.currentStatus = t;
            if(t==0){
                location.hash = '/expertdetail/'+row['username'];
            }else{
                this.showStatus = true;
            }
        },
        closeStatusCallback:function (v) { //变比弹窗并刷新数据
            this.showStatus = false;
            if(v) this.getList();
        },
        listReverse:function(){
            this.sortType = !this.sortType;
            this.sortMod = 'publishtime';
            var param = ['status',this.status,'page',this.page,'sortmod',this.sortMod,'sorttype',this.sortType ? 'asc': 'desc'];
            location.hash = '/expertlist/'+param.join('_');
            this.getList();
        },
        userResearch:function () {
            if(!this.username){
                this.alert=
                    {
                        type: 'alert-danger',content: '专家名字未填写', show: true, callback:function(){
                        this.alert.show = false;
                    }.bind(this)
                    };
                return false;
            }
            this.userRefresh = true;
            this.getJson({mod:'getuserinfo',username:this.username},function (data) {
                this.list = data.data;
                this.total = 1;
            }.bind(this));
        },
        passCode:function (username,flag) {
            this.getJson({mod:'updateuserverify',username:username,status:flag},function (data) {
                this.alert = {type:'alert',content:data.code==1?'操作成功':('操作失败'+data.msg),show:true,callback:function () {
                        this.alert.show = false;
                }.bind(this) }
            }.bind(this));
        },
        skillClick: function(username,skill) {
            if(this.status == 1){
                this.input = {
                    title: '技能', content: skill, show: true, callback: function (content) {
                        this.updateSkill(username,content);
                        this.input.show = false;
                    }.bind(this)
                }
            }
        },
        updateSkill: function (username,skill) {
            this.getJson({mod:'updateskill',username:username,skill:skill},function (data) {
                if(data.code == 1){
                    this.userRefresh ? this.userResearch() : this.getList();
                }else{
                    this.alert = {type:'alert',content:data.code==1?'更新成功':('更新失败'+data.msg),show:true,callback:function () {
                        this.alert.show = false;
                    }.bind(this) }
                }
            }.bind(this));
        }

    },
    filters:{
        getButtonText:function (t) {
            var text = {
                '-1':'审核',
                '0':'查看',
                '1':'取消资格'
            }
            return text[t];
        }
    },
    watch:{
        status:function () {
            if(this.status == 1){
                this.getJson({
                    mod:'expertTime'
                },function (data) {
                    this.list.push(data);
                }.bind(this))
            }
        }
    }
}) ;

//专家详情页面
var expertdetailView = Vue.extend({
    mixins:[appCommonent],
    template:'#expertdetail',
    mounted:function () {  //挂载初始化
        this.username = this.$route.params.username;
    },
    data:function () {
        return {
            detail:{
            },
            currentStatus:0,
            showStatus:false,
        }
    },
    methods:{
        closeStatusCallback:function (v) { //变比弹窗并刷新数据
            this.showStatus = false;
            if(v) this.detail.status = v;
        },
        check:function (flag) {
            this.showStatus = true;
            if(flag){
                this.currentStatus = 1;
            }else{
                this.currentStatus = this.detail['status']==1?-2:-1;
            }
        }
    },
    watch: {
        username:function (n,o) {
            this.getJson({mod:'expertdetail',username:n},function (data) {
                if(data){
                    this.detail = data;
                    if(this.detail.idimage){
                        this.detail.idimage = this.detail.idimage.split(',');
                        this.detail.idimage_positive = filepath+  this.detail.idimage[0];
                        this.detail.idimage_opposite = filepath +  this.detail.idimage[1];
                    }else {
                        this.detail.idimage = ['',''];
                    }
                    if(this.detail.resource){
                        this.detail.resource = filepath + this.detail.resource.split(',')[1];
                    }
                }
            }.bind(this))
        }
    },
    filters:{
        getStatus:function (t) {
            var text = {
                '-2':'审核通过后被取消',
                '-1':'审核未通过',
                '0':'未审核',
                '1':'审核通过'
            }

            return text[t];
        },
        getStatusClass:function (t) {
            var text = {
                '-2':'alert-danger',
                '-1':'alert-danger',
                '0':'alert-info',
                '1':'alert-success'
            }

            return text[t];
        },
    }
});

//文章列表页面           改到这里了 **********
var articlelistView = Vue.extend({
    mixins:[appCommonent],
    template:'#articlelist',
    mounted:function () {  //挂载初始化
        this.setSearchParam();
        this.getList();
    },
    data:function () {
        return {
            userinfo:'',
            searchuser:'username',
            paytype: -1,
            clickChangePaytype: false
        }
    },
    methods: {
        getList:function () {
            this.getJson({mod:'articlelist',searchuser:this.searchuser,userinfo:this.userinfo,page:this.page,size:this.size,paytype:this.paytype,start:this.start,end:this.end},function (data) {
                this.total = Math.ceil(data.total/this.size);
                data.list.forEach(function (v,k) {
                    v.checked =  false;
                    data.list[k] = v;
                })
                this.list = data.list;
                this.inited = true;
            }.bind(this));
        },
        setJjstatus:function (id) {
            var index = -1,value=-1;
            if(this.list)this.list.forEach(function (v,k) {
                if(v['aid']==id){
                    value = v['jjstatus'] ;
                    index = k;
                }
            })
            if(index!=-1)this.getJson({mod:'jjstatus',id:id,jjstatus:(value==0?1:0)},function (d) {
                if(d){
                   this.list[index]['jjstatus'] =(value==0?1:0);
                }
            }.bind(this));
        },
        offLineArticle:function (id) {
            this.getJson({mod:'offline',id:id},function (d) {
                if(d){
                    this.getList();
                }
            }.bind(this));
        },
        search:function () {
            this.start =  $('#start').val();//使用日期控件导致model失效 待解决。
            this.end = $('#end').val();
            var param = ['paytype',this.paytype,'page',this.page,'userinfo',this.userinfo,'searchuser',this.searchuser,'start',this.start,'end',this.end];
            location.hash = '/articlelist/'+param.join('_');
        },
        createArticle:function () {
            var aid = [];
            this.list.forEach(function (v) {
                if(v.checked)aid.push(v.aid);
            })
            if(aid.length>0)this.getJson({mod:'createarticle',aid:aid.join(',')},function (data) {
                this.alert = {type:'alert',content:data.code==1?'生成成功':('生成失败'+data.msg),show:true,callback:function () {
                    this.alert.show = false;
                }.bind(this) }
            }.bind(this))
        }
    },
    watch:{
        paytype:function (n,old) {
            if(this.clickChangePaytype){
                this.page = 1;
                this.search();
            }
        }
    }
}) ;

var edit1,edit2;
var articledetailView = Vue.extend({
    mixins:[appCommonent],
    template:'#articledetail',
    mounted:function () {  //挂载初始化
        this.id = this.$route.params.id;

        edit1 = new nicEditor();
        edit1.setPanel('panel1');
        edit1.addInstance('content1');

        edit2 = new nicEditor();
        edit2.setPanel('panel2');
        edit2.addInstance('content2');

    },
    data:function () {
        return {
            id:0,
            detail:{},
            tip:{},
        }
    },
    methods:{
        saveContent:function () {
            this.detail.freecontent = $('#content1').html();
            this.detail.paycontent = $('#content2').html();
            $.post('api/main.php?mod=savearticle',{id:this.id,title: this.detail.title,freecontent:this.detail.freecontent,paycontent:this.detail.paycontent},function (data) {
                this.tip = {'type': data.code==1?'success':'fail','content': data.code==1?'保存成功':'保存失败','show':true};
            }.bind(this),'json');
        }
    },
    watch: {
        id:function (n,o) {
            this.getJson({mod:'articledetail',id:n},function (data) {
                if(data){
                    this.detail = data;
                   /* this.$nextTick(function () { //初始化编辑器  编辑器与vue兼容性调整
                        if(edit1)  edit1.removeInstance('content1');
                        edit1= new nicEditor({buttonList : ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','fontFamily','fontFormat','indent','outdent','image','upload','link','unlink','forecolor','bgcolor','hr']}).panelInstance('content1');
                        if(edit2)  edit1.removeInstance('content2');
                        edit2 = new nicEditor({buttonList : ['bold','italic','underline','left','center','right','justify','ol','ul','fontSize','fontFamily','fontFormat','indent','outdent','image','upload','link','unlink','forecolor','bgcolor','hr']}).panelInstance('content2');
                    })*/
                }
            }.bind(this))
        }
    },
});


var accountingdetailView = Vue.extend({
    mixins:[appCommonent],
    template:'#accountingdetail',
    mounted:function () {  //挂载初始化
        this.id = this.$route.params.id;
    },
    data:function () {
        return {
            id:0,
            list:[],
            articleinfo:{},
            tipcount:0,
            tipmoney:0,
            paymoney:0,
            paycount:0,
            platform:{pc:0,
                ios:0,
                android:0,
                touch:0,
            }
        }
    },
    watch: {
        id:function(n) {
            this.getJson({mod:'accountingdetail',id:n},function (data) {
                if(data){
                    this.list = data.list;
                    this.list.forEach(function (v) {
                        if(v.paytype==1) {
                            this.paymoney++;
                            this.paymoney+= v.ordermoney;
                        }
                        else{
                            this.tipcount++;
                            this.tipmoney += parseFloat( v.ordermoney);
                        }
                        if(v.platform)this.platform[v.platform] ++ ;
                    }.bind(this));
                    this.articleinfo = data.articleinfo;
                }
            }.bind(this))
        }
    }
});

//查询作者账务
var accountinglistView = Vue.extend({
    mixins:[appCommonent],
    template:'#accountinglist',
    mounted:function () {
        this.setSearchParam();
        this.getList();
        this.initMonthList();
    },
    data:function () {
        return {
            type:1,  // 1 收入 -1 支出
            monthList:[],
            clickChangePaytype: false
        }
    },
    methods: {
        getList:function () {
           this.getJson({mod:'accountinglist',page:this.page,size:this.size,type:this.type,start:this.start,end:this.end,searchuser:this.searchuser,userinfo:this.userinfo},function (data) {
                this.total = Math.ceil(data.total/this.size);
                this.list = data.list;
                this.totalmoney = 0;
                this.inited = true;
            }.bind(this));
        },
        search:function () {
            this.start =  $('#start').val();//使用日期控件导致model失效 待解决。
            this.end = $('#end').val();
            var param = ['type',this.type,'page',this.page,'nickname',this.nickname,'start',this.start,'end',this.end,'searchuser',this.searchuser,'userinfo',this.userinfo];
            location.hash = '/accountinglist/'+param.join('_');
        },
        showExpert:function (id) {
            location.hash = '/expertdetail/' + id;
        },

        initMonthList:function () {
            var date = new Date();
            var month = date.getMonth(),year = date.getFullYear();
            month = month+1;
            var m  = [];
            for(var i=month - 5>0?month - 5:1;i<=month;i++){
                i = ('0'+i).slice(-2);
                m.push(year + '-' + i);
            }
            this.monthList = m.reverse();
            if(this.monthList.length<3){
                this.monthList.push(year-1+'-12',year-1+'-11');
            }
        },
        saveData:function (v,event) {
            v.paytime = $(event.target).parent().prev().prev().children().val();
            var param = {
                'mod':'saveaccounting',
                'id':v.sid,
                'payer':v.payer,
                'paytime':v.paytime,
            } 
           this.getJson(param,function (data) {
               this.tip = {'type': data.code=1?'success':'fail','content':data.code=1?'更新成功':'更新失败',show:true};
            }.bind(this));
        },
        createExcel:function (month) {
            location.href ='api/excel/php?month='+month;
        },
        toDetail:function (id) {
            location.hash = '/accountingdetail/'+id;
        }
    },
    watch:{
        type:function (n,old) {
            if(this.clickChangePaytype){
                this.page = 1;
                this.search();
            }
        }
    }
}) ;

//公告管理页面
var noticelistView = Vue.extend({
    mixins:[appCommonent],
    template:'#noticelist',
    mounted:function () {  //挂载初始化
        this.setSearchParam();
        this.getList();
    },
    methods: {
        getList:function () {
            this.getJson({mod:'noticelist',page:this.page,size:this.size},function (data) {
                this.total = Math.ceil(data.total/this.size);
                this.list = data.list;
                this.inited = true;
            }.bind(this));
        },
        setSearchParam:function () {
            var param = this.$route.params.search.split('_');
            for(var i=0;i<param.length;i+=2){
                this[param[i]] = param[i+1];
            }
        },
        search:function () {
            var param = ['page',this.page];
            location.hash = '/noticelist/'+param.join('_');
        },
        deleteNotice:function (id) {
            this.getJson({mod:'deletenotice','id':id},function (data) {
                this.alert = {type:'alert',content:data.msg,show:true,callback:function () {
                    this.alert.show = false;
                    this.getList();
                }.bind(this) }
            }.bind(this));
        }
    },
}) ;

//公告编辑页面
var edit3;
var noticeeditView = Vue.extend({
    mixins:[appCommonent],
    template:'#noticeedit',
    mounted:function () {
        this.id = this.$route.params.id;
        edit3 = new nicEditor();
        edit3.setPanel('panel3');
        edit3.addInstance('content3');
    },
    data:function () {
        return {
            id:0,
            detail:{},
        }
    },
    methods:{
        save:function () {
            this.detail.content =  $('#content3').html();
            $.post('api/main.php?mod=noticeedit',{title:this.detail.title,content:this.detail.content},function (data) {
                if(data.code==1) location.href = '#/noticelist/page_1';
                this.tip = {'type': data.code=1?'success':'fail','content':data.msg,show:true};
            }.bind(this),'json');
        },
    },
    watch: {
        id:function (n,o) {
            this.getJson({mod:'noticedetail',id:n},function (data) {
                if(data){
                    this.detail = data;
                }
            }.bind(this))
        }
    },
});



//战绩查询页面

var targetListView = Vue.extend({
    mixins:[appCommonent],
    template: "#targetList",
    data:function () {
        return {
            data: {
                projectnum: 3,
                ranktype: '命中率',
                isreverse: true
            },
            alert:{
                type: 'alert-danger',
                content: '',
                show: false
            },
            list:[]
        }
    },
    mounted:function () {

        var time = new Date();
        var timeEnd = this.getTime(),
            timeStart = this.getTime(time.getTime() - 7 * 24 * 3600 * 1000);

        $("#timeStart").val(timeStart);
        $("#timeEnd").val(timeEnd);

        this.getExpertRankList();
    },
    computed:{
        getRankType: function () {
            if(this.data.ranktype === '命中率'){
                return 'mzl';
            }else if(this.data.ranktype === '回报率'){
                return 'huibao';
            }else{
                return 'projectnum';
            }
        }
    },
    methods:{
        getExpertRankList:function () {
            var starttime = $("#timeStart").val(),
                endtime = $("#timeEnd").val();
            if(!starttime){
                this.alert=
                    {
                        type: 'alert-danger',content: '开始时间未填写', show: true, callback:function(){
                            this.alert.show = false;
                        }.bind(this)
                    };
                return false;
            }
            if(!endtime){
                this.alert={type: 'alert-danger',content: '结束时间未填写', show: true,callback:function(){
                    this.alert.show = false;
                }.bind(this)
                };
                return false;
            }
            if(!this.data.projectnum){
                this.alert={type: 'alert-danger',content: '专家最少单数未填写', show: true,callback:function(){
                    this.alert.show = false;
                }.bind(this)
                };
                return false;
            }
            this.getJson({
                'mod': 'getexpertranklist',
                'starttime': starttime,
                'endtime' : endtime,
                'projectnum': this.data.projectnum,
                'ranktype': this.getRankType,
                'isreverse': this.data.isreverse ? 'True' : 'False'
            },function (data) {
                this.list = data.data;
            }.bind(this));
        },
        listReverse: function () {
            this.data.isreverse =  !this.data.isreverse;
            this.getExpertRankList();
        },
        getExpertMatchList: function (event) {
            this.$refs.childComponent.getExpertMatchList(event);
        },
        getTime:function (date) {
            var time;
            if(!date){
                 time = new Date();
            }else{
                 time = new Date(date);
            }
            var year = time.getFullYear(),
                month = (time.getMonth() + 1) < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1,
                d = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();

             return year + '-' + month + '-' + d;
        }
    }
});


//订单查询

var orderQuery = Vue.extend({
    mixins:[appCommonent],
    template: "#orderquery",
    data:function () {
        return {
            type: 1,
            orderData: []
        }
    },
    methods:{
        search:function () {
            if(this.type == 1){
            if(!this.username){
                this.alert=
                    {
                        type: 'alert-danger',content: '用户名未填写', show: true, callback:function(){
                        this.alert.show = false;
                    }.bind(this)
                    };
                return false;
            }
            if(!this.start){
                this.alert=
                    {
                        type: 'alert-danger',content: '开始时间未填写', show: true, callback:function(){
                        this.alert.show = false;
                    }.bind(this)
                    };
                return false;
            }
            if(!this.end){
                this.alert=
                    {
                        type: 'alert-danger',content: '结束时间未填写', show: true, callback:function(){
                        this.alert.show = false;
                    }.bind(this)
                    };
                return false;
            }
            this.getJson({
                'mod': 'getorderlist',
                'username': this.username,
                'starttime': this.start,
                'endtime': this.end,
                'page': this.page
            },function (data) {
                if(data.code === '1'){
                    this.total = Math.ceil(data.total/10);
                    this.orderData = data.data;
                }
            }.bind(this));
        }
        }
    }
});

//专家具体场次

Vue.component('component-expermatchlist',Vue.extend({
    mixins: [appCommonent],
    template: '#expermatchlist',
    data: function () {
        return{
            matchPage: 0,
            type: 1,
            show: false,
            toastHeader: {
                username: '',
                nickname: '',
                timeStart: '',
                timeEnd: ''
            },
            matchList:[],
            total: 0,
            numList:[]
        }
    },
    methods:{
        getExpertMatchList: function(event){
            this.toastHeader.username = $(event.currentTarget).attr('data-name').trim();
            this.toastHeader.nickname = $(event.currentTarget).text().trim();
            this.toastHeader.timeStart = $("#timeStart").val().trim();
            this.toastHeader.timeEnd = $("#timeEnd").val().trim();
            this.getJson({
                'mod': 'getexpertmatchlist',
                'username': this.toastHeader.username,
                'starttime': this.toastHeader.timeStart,
                'endtime': this.toastHeader.timeEnd,
                'page': this.matchPage,
                'type': this.type
            },function(data){
                this.matchList = data.data;
                this.total = (parseInt(data.total) % 10) == 0 ? (parseInt(data.total)/10) : (Math.floor(parseInt(data.total)/10)+1);
                if(this.total <= 10){
                    this.numList = [];
                    for(var i=1; i<=this.total; i++){
                        this.numList.push(i);
                    }
                }else{
                    this.numList = [1,2,3,4,5,6,7,8,9,this.total];
                }
                this.show = true;
            }.bind(this));
        },
        getExpertData: function () {
            this.getJson({
                'mod': 'getexpertmatchlist',
                'username': this.toastHeader.username,
                'starttime': this.toastHeader.timeStart,
                'endtime': this.toastHeader.timeEnd,
                'page': this.page-1,
                'type': this.type
            },function(data){
                this.matchList = data.data;
            }.bind(this));
        },
        pageChange: function (event) {
            this.page = parseInt($(event.currentTarget).text().trim());
            this.getExpertData();
            if(this.total >= 10){
                if(this.page === 1 || this.page <= 5){
                    this.numList = [1,2,3,4,5,6,7,8,9,this.total];
                    return;
                }
                if(this.page === this.total || this.page >= this.total - 5){
                    this.numList = [1];
                    for(var i = this.total-8; i <= this.total; i++){
                        this.numList.push(i);
                    }
                    return;
                }
                if(this.page >= 6 && this.page != this.total) {
                    this.numList = [1];
                    for (var j = this.page - 3; j <= this.page + 4; j++) {
                        this.numList.push(j);
                    }
                    this.numList.push(this.total);
                }
            }
        },
        expertInfo:function (item) {
            var annInfo = item.info;
            switch (parseInt(item.type)){
                case 1:
                    var infoArr = item.info.split("@");
                    if(infoArr[0]){
                        if(infoArr[0] === '3'){
                            annInfo = '胜@' + infoArr[1];
                        }else if(infoArr[0] === '1'){
                            annInfo = '平@' + infoArr[1];
                        }else{
                            annInfo = '负@' + infoArr[1];
                        }
                    }
                    break;
                case 2:
                    break;
                case 3:
                    annInfo = item.info.split("@")[0] === '3' ? item.home + '@' + item.info.split("@")[1] : item.away + "@" + item.info.split("@")[1];
                    break;
                case 4:
                    var arr =item.info.split("@");
                    if(arr[0]){
                        annInfo = arr[0] === '3' ? '大球@' + arr[1] : '小球@' + arr[1];
                    }
                    break;
                default:
                    break;
            }
            return annInfo;
        }
    }
}));
var router = new VueRouter({
    routes:[
        {path:'/expertlist/:search',component:expertlistView},
        {path:'/expertdetail/:username',component:expertdetailView},
        {path:'/articlelist/:search',component:articlelistView},
        {path:'/articledetail/:id',component:articledetailView},
        {path:'/accountingdetail/:id',component:accountingdetailView},
        {path:'/accountinglist/:search',component:accountinglistView},
        {path:'/noticelist/:search',component:noticelistView},
        {path:'/noticeedit/:id',component:noticeeditView},
        {path:'/targetlist/',component:targetListView},
        {path:'/orderquery/',component:orderQuery},
        {path:'/',component:noticelistView},
    ]
});

var main = new Vue({
    router:router
}).$mount('#main');



 ///工具
 Date.prototype.Format = function (fmt) { //author: meizz
     var o = {
         "M+": this.getMonth() + 1, //月份
         "d+": this.getDate(), //日
         "h+": this.getHours(), //小时
         "m+": this.getMinutes(), //分
         "s+": this.getSeconds(), //秒
         "q+": Math.floor((this.getMonth() + 3) / 3), //季度
         "S": this.getMilliseconds() //毫秒
     };
     if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
     for (var k in o)
         if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
     return fmt;
 }
