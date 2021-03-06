/**
 * Page main js functionality
 * @param
 * @return
 **/
var main = function() {

  //Initialize variables
  var usedColors = [];
  var randColor;

  //Set a new different color for each child $(.relevant p) jquery object
  $(".relevant p").each(function() {
    var thisEl = this;
    window.setTimeout(function() {
      randColor = generateNewRandomColor(usedColors);
      $(thisEl).css("color", randColor);
      $(thisEl).fadeIn();
    }, 500);
  });
}

//Hide parapraph elements before document ready
$(".relevant p").hide();

$(document).ready(main);
/**
 * Generates a random color
 * @param usedColors - array of colors that should not be skipped
 * @return randColor - a random color in rgb format
 **/
var generateNewRandomColor = function(usedColors) {
  var randColor;
  var colorR = Math.floor((Math.random() * 256));
  var colorG = Math.floor((Math.random() * 256));
  var colorB = Math.floor((Math.random() * 256));
  randColor = "rgb(" + colorR + ", " + colorG + ", " + colorB + ")";

  //Check if random color generated has been used before, if so generate again
  if ($.inArray(randColor, usedColors) > -1) {
    generateNewRandomColor(usedColors);
  }

  return randColor;
}
