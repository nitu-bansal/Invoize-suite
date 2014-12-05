'use strict';

angularApp.service('CryptionService', function($http, $q, $stateParams) {
    //Our Custom Wrapper functions//
    var keyLength = 16;
    var key = null;
    if(localStorage.k) init(Base64.decode(localStorage.k));

    function init(myKey){
        AES_Init();

        if(myKey) key = myKey;
        else{
            key = Date.now()+'aes';
            localStorage.k = Base64.encode(key);
        }
//      keyLength = myKey.length;
        key = string2Bin(key);
        AES_ExpandKey(key);
        return key;
    }

    function encrypt (inputStr,key) {
        var block = string2Bin(inputStr);
        AES_Encrypt(block, key);
        var data=bin2String(block);
        return data;
    }
    function decrypt ( inputStr,key ) {
        var block = string2Bin(inputStr);
        AES_Decrypt(block, key);
        var data=bin2String(block);
        return data;
    }
//    function encryptLongString (myString,key) {
//        if(myString.length>keyLength){
//            var data='';
//            for(var i=0;i<myString.length;i=i+keyLength){
//                data+=encrypt(myString.substr(i,keyLength),key);
//            }
//            return data;
//        }else{
//            return encrypt(myString,key);
//        }
//    }
//    function decryptLongString (myString,key) {
//        if(myString.length>keyLength){
//            var data='';
//            for(var i=0;i<myString.length;i=i+keyLength){
//                data+=decrypt(myString.substr(i,keyLength),key);
//            }
//            return data;
//        }else{
//            return decrypt(myString,key);
//        }
//    }
//    function finish(){
//        AES_Done();
//    }
    function bin2String(array) {
        var result = "";
        for (var i = 0; i < array.length; i++) {
            result += String.fromCharCode(parseInt(array[i], 2));
        }
        return result;
    }
    function string2Bin(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return result;
    }

    function bin2String(array) {
        return String.fromCharCode.apply(String, array);
    }


    return {
        encrypt:function(text){
            if(!localStorage.k)
            init();
            if(text.length>keyLength){
                var data='';
                for(var i=0;i<text.length;i=i+keyLength){
                    data+=encrypt(text.substr(i,keyLength),key);
                }
                return data;
            }else{
                return encrypt(text,key);
            }
        },
        decrypt:function(text){
            if(text.length>keyLength){
                var data='';
                for(var i=0;i<text.length;i=i+keyLength){
                    data+=decrypt(text.substr(i,keyLength),key);
                }
                return data;
            }else{
                return decrypt(text,key);
            }
        },
        finish:function(){
            AES_Done();
        }
    }

//usage
//var key=init(usedKey);
//alert(key);
//encrypted=encryptLongString(myStr,key);
//alert('after encrypt='+encrypted);
//decrypted=decryptLongString(encrypted,key);
//alert('after decrypt='+decrypted);
//finish();

});