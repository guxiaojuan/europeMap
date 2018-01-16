var alertlayer = $('.ui-alert-layer');
Date.prototype.formatDate=function(a){var c=a;var b=(this.getMonth()>>0)+1;c=c.replace(/yyyy|YYYY/,this.getFullYear());c=c.replace(/yy|YY/,(this.getYear()%100)>9?(this.getYear()%100).toString():"0"+(this.getYear()%100));c=c.replace(/MM/,b>9?b.toString():("0"+b));c=c.replace(/M/g,b);c=c.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():"0"+this.getDate());c=c.replace(/d|D/g,this.getDate());c=c.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():"0"+this.getHours());c=c.replace(/h|H/g,this.getHours());c=c.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():"0"+this.getMinutes());c=c.replace(/m/g,this.getMinutes());c=c.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():"0"+this.getSeconds());c=c.replace(/s|S/g,this.getSeconds());return c};
if (!Array.prototype.forEach){Array.prototype.forEach = function(fun, thisp){var len = this.length;if (typeof fun != "function")throw new TypeError();var thisp = arguments[1];for (var i = 0; i < len; i++) {if (i in this) {fun.call(thisp, this[i], i, this);}}};}
//��ҳ���
var pageView = Vue.component('component-page',{ //��ҳ��� �ȶ��壡��ʹ�ã�
    props: ['page','total'],
    template:'<div class="page"><ul class="pagination" v-on:click="pagechange" v-html="numlist"></ul></div>',
    // <li v-for="i in total"  v-bind:class="{active:i==page}" v-on:click="pagechange(i)"><a href="javascript:;">{{i}}</a></li>
    methods: {
        pagechange: function (event) {
            if(event.target.nodeName=='A'){
                this.page = event.target.innerHTML - 0;
                this.$emit('pagechange',this.page);
            }

        }
    },
    computed:{
        numlist:function () {
            var li = '';
            if(this.total<=10){
                for(var i=1;i<=this.total;i++){
                    li += '<li class="' + (i==this.page?'active':'"') + '"><a href="javascript:;">'+ i +'</a></li>';
                }
            }else{ //page�����ŵ��м�
                li = '<li class="' + (1==this.page?'active':'"') + '"><a href="javascript:;">1</a></li>';
                var num1 = this.page > 5?3:(this.page -2);
                var num2 = this.total - this.page >5?4:(this.total - this.page -1);
                if(num1<3) num2 = 7 - num1;
                if(num2<4) num1 = 7 - num2;
                for(var i = this.page - num1  ;i<=this.page - 0  +num2; i++){
                    li += '<li class="' + (i==this.page?'active':'"') + '"><a href="javascript:;">'+i+'</a></li>';
                }
                li += '<li class="' + (this.total==this.page?'active':'"') + '"><a href="javascript:;">'+this.total+'</a></li>';
            }
            return li;
        }
    }
});

/**
 * ���ר�ҵ��������
 */
var checkStatus = Vue.component('component-checkStatus',{
    props: ['row','status','show','nickname'],
    template:'<div class="panel panel-info alert-box" v-if="show">\
                    <div class="panel-heading" v-if="status==1"><h3 class="panel-title">���ͨ��</h3></div>\
                    <div class="panel-body text-center" v-if="status==1"><p>��ȷ��ר�ҡ�{{row["nickname"]}}�����ͨ��</p></div>\
                    <div class="panel-heading" v-if="status!=1"><h3 class="panel-title">����дר�ҡ�{{row["nickname"]}}����˲�ͨ����ԭ��</h3></div>\
                    <div class="panel-body" v-if="status!=1"><p><div class="input-group"><input type="text" class="form-control" v-bind:value="message"><div class="input-group-btn"><button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">ѡ��ԭ��<span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right"> <li v-for="v in messageList"><a href="javascript:;" v-on:click="message=v">{{v}}</a></li></ul></div></div></p></div>\
                    <div class="panel-footer text-center"  v-if="status!=100"><div class="btn-group-sm"><button type="button" class="btn btn-default" v-on:click="closeStatus(false)"  style="margin-right: 10px;">ȡ��</button><button type="button" class="btn btn-default btn-success" v-on:click="submitStatus">ȷ��</button></div></div>\
                    <div class="panel-body text-center" v-if="submit"><p>{{submitTip}}</p></div>\
                </div>',
    data:function () {
        return {
            message:'',
            messageList:['���֤�����벻����','����ͷ�������֤��Ƭ���ϴ�','��Ʒ����վ���󲻷�','������������վ������ͬ','����˼·�����壬ȱ��˵������','���������������������'],
            submitTip:'',
            submit:false,
        }
    },
    methods: {
        submitStatus: function () {
            $.getJSON('api/main.php',{mod:'submitstatus',username:this.row['username'],'status':this.status,'reason':this.message},function (data) {
                this.submitTip = data.msg;
                this.submit = true;
                this.closeStatus(true);
            }.bind(this));
        },
        closeStatus:function (confirm) {
            setTimeout(function () {
                this.$emit('closeStatus',confirm?this.status:0);  //����ύ�˷����ύ��� 1 -1 ���û�ύ ����0
            }.bind(this),confirm?2000:0);
        }
    },
    computed:{

    },
    watch:{
        show:function (n,o) {
            if(n){
                alertlayer.removeClass('hide');
                this.submit = false;
            }
            else{
                alertlayer.addClass('hide');
            }
        }
    }
});

/**
 * ��ʾ���
 */
var alertTip = Vue.component('component-alertTip',{
    props:['type','content','show'],
    template:'<div class="panel panel-info alert-box" v-if="show">\
                    <div class="panel-heading"><h3 class="panel-title">��ʾ</h3></div>\
                    <div class="panel-body text-center"><p>{{content}}</p></div>\
                    <div class="panel-footer text-center" ><div class="btn-group-sm"><button type="button" class="btn btn-default" v-on:click="close(false)"  style="margin-right: 10px;" v-if="type==\'confirm\'">ȡ��</button><button type="button" class="btn btn-default btn-success" v-on:click="close(true)">ȷ��</button></div></div>\
                </div>',
    methods:{
        close:function (confirm) {
            this.show = false;
            this.$emit('close',confirm);
        }
    },
    watch:{
        show:function (n,o) {
            if(n)alertlayer.removeClass('hide');
            else alertlayer.addClass('hide');
        }
    }
});

/**
 * ���ύ����ʾ���
 */
var lightTip = Vue.component('component-lightTip',{
    props:['type','content','show'],
    template:'<div v-if="show" class="alert" v-bind:class="type|getStatusClass"><strong>{{content}}</strong></div>',
    watch:{
        show:function (n) {

            if(n)setTimeout(function () {
                this.show = false;
            }.bind(this),3000);
        }
    },
    filters:{
        getStatusClass:function (t) {
            var text = {
                'fail':'alert-danger',
                'info':'alert-info',
                'success':'alert-success'
            }
            return text[t];
        },
    }
});

/*
* �����޸�
* */

var alertInput = Vue.component('component-alertInput',{
    props:['title','content','show'],
    template:'<div class="alert-input" v-if="show"> <div class="panel-mask"></div><div class="panel panel-info alert-box" >\
                    <div class="panel-heading"><h3 class="panel-title">{{title}}�޸�</h3></div>\
                    <div class="panel-body text-center"><input type="text" class="form-control" v-model="content"></div>\
                    <div class="panel-footer text-center" ><div class="btn-group-sm"><button type="button" class="btn btn-default" v-on:click="close(false)"  style="margin-right: 10px;">ȡ��</button><button type="button" class="btn btn-default btn-success" v-on:click="confirmCallback">ȷ��</button></div></div>\
                </div></div>',
    methods:{
        close:function (confirm) {
            this.show = false;
            this.$emit('close',confirm);
        },
        confirmCallback: function () {
            this.$emit('confirmCallback',this.content);
        }
    }
});
