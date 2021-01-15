
$('.reply_button').click(function(){
    var sended_token = document.getElementById('sended_token').value;
    var token = document.getElementsByClassName('token');
    for(let i = 0; i< token.length; i++) {
        token[i].value =sended_token;
    }
});