<?php
/**
 * Created by PhpStorm.
 * User: xiaoxx
 * Date: 2017/11/15
 * Time: 15:23
 */
include($_SERVER["Root_Path"]."/inc/bootstrap.php");
include($_SERVER["Root_Path"]."/inc/function.php");



$act = getRequest('act','');

$aRet = User_CheckLogin::get_MemCached();
$sUsername = isset($aRet['username']) ? $aRet['username'] : '';

if(!$sUsername){
    json_out(-1000,'nologin',array());
}

$baseUrl = $_SERVER['Base_Ews'].'/imarket';
$sUsername = iconv('gbk','utf-8',$sUsername);

// 判断登录 获取usercheck
if($act == 'getuser'){
    if(!$sUsername){
        json_out(-100,'err',array());
    }else{
        json_out(1,'ok',array('username'=>$sUsername));
    }
}


function getUserCookie(){
    $str = '';
    foreach ($_COOKIE as $key=>$value){
        $str = $str.$key.'='.urlencode($value).';';
    }
    return $str;
}

//是否领券
if($act == 'isreceive'){
    $sUsername = iconv('gbk','utf-8',$sUsername);
    $url = $baseUrl.'/hddraw/ddraw?hdid=648&username='.$sUsername;
    $ret = Comm_Interface::curlGetRequest($url,getUserCookie());
    header('Content-type:application/json');
    echo $ret;exit();
}

//派劵
if ($act == 'getdiscount'){
    $url = $baseUrl.'/hdquery/getuserhdyhq?hdid=648&username='.$sUsername;
    $ret = Comm_Interface::curlGetRequest($url,getUserCookie());
    header('Content-type:application/json');
    echo $ret;exit();
}

//领取验证码
if ($act == 'getcode'){
    $phone = isset($_POST['phone']) ? intval($_POST['phone']) : '';
    $param = array('phone'=>$phone);
    $param = iconv_array_new('gbk', 'utf-8', $param);
    $url = $baseUrl.'/hdcheck/sendpcode?hdid=648&username='.$sUsername;
    $ret = curlPostRequest($url,$param,getUserCookie());
    header('Content-type:application/json');
    echo $ret;exit();
}

//验证
if($act == 'checkcode'){
    $stepkey = isset($_POST['stepkey']) ? trim($_POST['stepkey']) : '';
    $code = isset($_POST['code']) ? intval($_POST['code']) : '';
    $param = array('stepkey'=>$stepkey,'code'=>$code);
    $param = iconv_array_new('gbk', 'utf-8', $param);
    $url  = $baseUrl.'/hdcheck/checkpcode?hdid=648';
    $ret = curlPostRequest($url,$param,getUserCookie());
//    var_dump($url);var_dump($param);exit();
    header('Content-type:application/json');
    echo $ret;exit();
}


if($act == 'test'){
    $url = 'http://huodong.500boss.com/~xiaoxx/huodong.500.com/html/2017/laxin/test.php';
    $param = array('username'=>'xiaoxx','pass'=>123);
    $ret = curlPostRequest($url,$param,getUserCookie());

    var_dump($ret);exit();
}

json_out(-100,'err',array());

function json_out($code=-100,$msg='err',$data=array()){
    header('Content-type:application/json');
    echo json_encode(array('code'=>$code,'msg'=>$msg,'data'=>iconv_array_new('gbk','utf8',$data))); exit();
}

function curlPostRequest($post_url, $aParam,$cookie="", $headers=array())
{
    $post_fields = $aParam;
    $ch             =  curl_init();
    $url = 'http://'.$_SERVER['SERVER_NAME'].(isset($_SERVER["REQUEST_URI"])?$_SERVER["REQUEST_URI"]:'');
    $ua  = isset($_SERVER['HTTP_USER_AGENT'])?$_SERVER['HTTP_USER_AGENT']:'';
    $uuid = isset($_COOKIE['CLICKSTRN_ID'])?$_COOKIE['CLICKSTRN_ID']:'12341234123dfasfdf32r134234123';
    $cookie = sprintf("CLICKSTRN_ID=%s;%s",urlencode($uuid),$cookie);
    if(!empty($headers)) {
        curl_setopt($ch,CURLOPT_HTTPHEADER,$headers);
    }
    curl_setopt($ch,CURLOPT_AUTOREFERER,true);
    curl_setopt($ch,CURLOPT_URL,$post_url);
    curl_setopt($ch,CURLOPT_POST,true);
    curl_setopt($ch,CURLOPT_POSTFIELDS,$post_fields);
    curl_setopt($ch,CURLOPT_REFERER, $url);
    curl_setopt($ch,CURLOPT_USERAGENT, $ua);
    curl_setopt($ch,CURLOPT_COOKIE, $cookie);   ///将用户点击流cookie加进去
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
    curl_setopt($ch,CURLOPT_HEADER,true);
    curl_setopt($ch,CURLOPT_TIMEOUT,5);
    curl_setopt($ch,CURLOPT_VERBOSE,false);
    $ret=curl_exec($ch);#?得到的返回值
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $result_headers = substr($ret, 0, $headerSize);
    $results = substr($ret, $headerSize);
    preg_match('/Set-Cookie:(.*);/iU',$result_headers,$str);
    if($str){
        header($str[0].' Path=/');
    }   
//    $cookie = $str[1];
    //echo ($post_url."?".http_build_query($post_fields));
    curl_close($ch);
//    var_dump($cookie);exit();
    unset($ch);
    var_dump($post_url,$cookie,$aParam);
    return $results;
}