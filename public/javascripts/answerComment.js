

$('.answer_button').click(function(){
    var id = this.id;
    var form = $('.' + id);
    form.css('display', 'block');
});