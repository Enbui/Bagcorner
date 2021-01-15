
$(document).ready(function () {
    $(".search-product").keyup(function () {

        // Retrieve the input field text and reset the count to zero
        var filter = $(this).val();
        if (!filter) {
            $(".product_item-infor").show();
            return;
        }

        var regex = new RegExp(filter, "i");
        // Loop through the comment list
        $(".product_item-infor").each(function () {

            // If the list item does not contain the text phrase fade it out
            if ($(this).data("search").search(regex) < 0) {
                $(this).hide();

                // Show the list item if the phrase matches and increase the count by 1
            } else {
                $(this).show();
            }
        });
    });
});
