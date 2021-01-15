const stars = document.querySelectorAll(".star");
const rating = document.querySelector('.rating');
for(let i = 0; i<stars.length; i++) {
    stars[i].starValue = (i + 1);
    ["mouseover","mouseout","click"].forEach(function(e){
        stars[i].addEventListener(e,starRate);

    });
}

function starRate(e){
    let type = e.type;
    let starValue = this.starValue;
    if(type ==="click") {
        if(starValue >1) {
            // rating.innerHTML = "You rated this " + starValue + "stars";
            rating.value = starValue;
        }
    }
    stars.forEach(function(element, index){
        if(type === "click") {
            if(index < starValue) {
                element.classList.add("fix");
            }
            else {
                element.classList.remove("fix");
            }
        }
        if(type ==="mouseover") {
            if(index <starValue) {
                element.classList.add("over");
            }
            else {
                element.classList.remove("over");
            }
        }
        if(type ==="mouseout") {
            element.classList.remove("over");
        }
    })
}


