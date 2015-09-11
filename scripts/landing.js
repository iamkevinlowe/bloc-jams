var pointsArray = document.getElementsByClassName('point');

var animatePoints = function(points) {
                
   var revealPoint = function(i) {
        points[i].style.opacity = 1;
        points[i].style.transform = "scaleX(1) translateY(0)";
        points[i].style.msTransform = "scaleX(1) translateY(0)";
        points[i].style.WebkitTransform = "scaleX(1) translateY(0)";
    };
    
    forEach(points, revealPoint);

};

window.onload = function() {
    
    var sellingPoints = document.getElementsByClassName('selling-points')[0];
    var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;
 
    if (window.innerHeight > 950) {
        animatePoints(pointsArray);
    }
    
    window.addEventListener('scroll', function(event) {
        
        if (document.body.scrollTop >= scrollDistance) {
            animatePoints(pointsArray);
        }
        
    });

};