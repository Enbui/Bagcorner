const ratingNumbers = [];
$('.ratingNumber').each(function () {
    ratingNumbers.push(this.value);
});

stars_inner = document.getElementsByClassName('stars-inner');


const starsTotal = 5;

for ( i = 0; i< ratingNumbers.length; i++) {
    console.log(ratingNumbers[i]);
    const starPercentage = (ratingNumbers[i] / starsTotal) * 100;  
    const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
   stars_inner[i].style.width = starPercentageRounded;
}      