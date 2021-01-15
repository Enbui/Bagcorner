$(document).on("change", ".price-sorting", function () {
    var sortingMethod = $(this).val();
    if (sortingMethod === 'ascending') {
        sortProductsPriceAscending();
    }
    else if (sortingMethod === 'descending') {
        sortProductsPriceDescending();
    }
    else if(sortingMethod === "createDate") {
        sortProductCreateTime();
    }

});


function sortProductsPriceAscending() {
    let products = $('.product_item-infor');
    products.sort(function (a, b) { 
        return $(a).data("price") - $(b).data("price") ;
    });
    $(".containerItems").append(products);

}


function sortProductsPriceDescending() {
    let products = $('.product_item-infor');
    products.sort(function (a, b) { 
    return $(b).data("price") - $(a).data("price");
    });
    $(".containerItems").append(products);

}

function sortProductCreateTime() {
    let product = $(".product_item-infor");
    product.sort(function(a,b){
        return Math.abs(new Date($(a).data("date")) - new Date($(b).data("date"))) ;
    });
    $(".containerItems").append(products);
}




