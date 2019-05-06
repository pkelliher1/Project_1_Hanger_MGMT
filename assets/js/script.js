$("#bookmark-list").hide();
$("#recipe-bookmark").on("click", function() {
  $("#bookmark-list").toggle();
});
var recipeDiv;
var clickCounter = 0;

$(".search-form").on("submit", function(event) {
  var mainSearchBar = $("#ingredient-1")
    .val()
    .trim();
  var advSearchBar = $("#ingredient-2")
    .val()
    .trim();

  if (advSearchBar === "" && mainSearchBar === "") {
    alert("Please enter a keyword!");
    return;
  }
  // this automatically closes the advanced search modal window when the user submits
  $("#advSearchMod").modal("hide");

  event.preventDefault();
  $("#recipe-results").html("");

  var searchIngredient =
    $(".ingredient")
      .val()
      .trim() +
    $("#ingredient-2")
      .val()
      .trim();
  var resultsQuantity = $("#results-quantity").val();

  console.log({ searchIngredient });
  var maxCalories = $(".calories").val();
  //?high-fiber breaks it.
  var diet = "";
  if ($(".diet").is(":checked")) {
    diet = "&dietLabels=" + $(".diet:checked").val();
  }

  var time = "&time=" + $(".time").val();
  if ($(".time").val() === "") {
    time = "";
  }

  var healthArray = [];
  var healthString = "";
  $.each($(".health:checked"), function() {
    healthArray.push($(this).val());
    healthString = "&healthLabels=" + healthArray.join("&healthLabels=");
  });

  //excluded can have multiple responses separated by a space
  var excludedArray = [];
  if ($(".excluded").val() === "") {
    var excludedString = "";
  } else {
    $.each($(".excluded"), function() {
      excludedArray = $(this)
        .val()
        .split(" ");
      excludedString = "&excluded=" + excludedArray.join("&excluded=");
    });
  }

  var queryURL =
    "https://api.edamam.com/search?q=" +
    searchIngredient +
    "&app_id=df8f013e&app_key=371aa3e4099265f1b0d249cf790f4336&from=0&to=" +
    resultsQuantity +
    "&calories=1-" +
    maxCalories +
    diet +
    time +
    healthString +
    excludedString;

  var recipeTitle;
  var results;

  console.log("query URL: " + queryURL);

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    console.log("ajax test");
    // console.log("results: " + results)

    for (var i = 0; i < response.hits.length; i++) {
      var recipeTitle = response.hits[i].recipe.label;
      var ingredients = [];
      for (j = 0; j < response.hits[i].recipe.ingredients.length; j++) {
        ingredients.push(" " + response.hits[i].recipe.ingredients[j].text);
      }
      // console.log("ingredients: " + ingredients);
      // console.log(response.hits[i].recipe.ingredients)

      // var listIngredients = $("<ul></ul>")
      //     for (n = 0; n < response.hits[i].recipe.ingredients.length; n++) {
      //         listIngredients.append("<li>" + response.hits[i].recipe.ingredients[n].text);
      //     }

      // console.log("list ingredients: " + listIngredients);

      // $("#ingredients-test").append(listIngredients);

      var servings = response.hits[i].recipe.yield;
      var totalCalories = response.hits[i].recipe.calories;
      var caloriesPerServing = Math.round(totalCalories / servings);
      var dietLabel = [];
      for (k = 0; k < response.hits[i].recipe.dietLabels.length; k++) {
        dietLabel.push(" " + response.hits[i].recipe.dietLabels[k]);
      }
      // console.log("diet label: " + dietLabel);
      var healthLabel = [];
      for (l = 0; l < response.hits[i].recipe.healthLabels.length; l++) {
        healthLabel.push(" " + response.hits[i].recipe.healthLabels[l]);
      }
      // console.log("healthLabel: " + healthLabel);
      var totalNutrients = "";

      for (var m in response.hits[i].recipe.totalNutrients) {
        totalNutrients +=
          "<li> " + response.hits[i].recipe.totalNutrients[m].label;
        totalNutrients +=
          " " + Math.round(response.hits[i].recipe.totalNutrients[m].quantity);
        totalNutrients +=
          " " + response.hits[i].recipe.totalNutrients[m].unit + "</li>";
        // console.log("m: " + m);
      }

      var recipeYield = response.hits[i].recipe.yield;

      var linkToInstructions = response.hits[i].recipe.url;

      var recipeDiv = $("<div>");
      recipeDiv.addClass("row");

      var recipeImage = $("<img>");
      recipeImage.css({
        "background-image": "url(" + response.hits[i].recipe.image + ")"
      });

      recipeDiv.attr("class", "recipe-click row");
      recipeDiv.attr("data-title", recipeTitle);
      recipeDiv.attr("data-ingredients", ingredients);
      recipeDiv.attr(
        "data-ingredientsData",
        JSON.stringify(response.hits[i].recipe.ingredients)
      );
      recipeDiv.attr("data-yield", recipeYield);
      recipeDiv.attr("data-caloriesperserv", caloriesPerServing);
      recipeDiv.attr("data-dietLabel", dietLabel);
      recipeDiv.attr("data-healthLabel", healthLabel);
      recipeDiv.attr("data-totalNutrients", totalNutrients);
      recipeDiv.attr("data-linkToInstructions", linkToInstructions);
      recipeDiv.attr("data-image", response.hits[i].recipe.image);

      // This will now tie the dynamically generated div to trigger the modal. -JKM
      recipeDiv.attr("data-toggle", "modal");
      recipeDiv.attr("data-target", "#singleRecipeMod");

      var title = $("<p>").text("Title: " + recipeTitle);
      var arrayOfIngredients = $("<p>").text("Ingredients: " + ingredients);
      var displayCaloriesPerServing = $("<p>").text(
        "Calories per Serving: " + caloriesPerServing
      );

      var recipeSubDiv = $("<div>");
      recipeSubDiv.addClass("col-md-6 article text-center");
      recipeSubDiv.append(title, arrayOfIngredients, displayCaloriesPerServing);

      var recipeImgDiv = $("<div>");
      recipeImgDiv.css({
        "background-image": "url(" + response.hits[i].recipe.image + ")"
      });
      recipeImgDiv.addClass("col-md-4 image-background");
      recipeImgDiv.append(recipeImage);

      recipeDiv.append(recipeImgDiv, recipeSubDiv);

      // test for forcing browser to scroll down
      function scrollDown() {
        window.scrollTo(0, 800);
        // $(this).scrollIntoView("#recipe-results");
        // $(this)[0].scrollIntoView();
      }
      scrollDown();

      $("#recipe-results").append(recipeDiv);
    }
  });

  this.reset();
});

// back-to-top button js
window.onscroll = function() {
  showBackTopBtn();
};

function showBackTopBtn() {
  // this reveals the "back-to-top" button only when the window has scrolled down by 600px or more
  if (
    document.body.scrollTop > 600 ||
    document.documentElement.scrollTop > 600
  ) {
    $("#back-to-top").css("display", "block");
  } else {
    $("#back-to-top").css("display", "none");
  }
}

$("#back-to-top").on("click", function() {
  scrollToTop();
});

// When the user clicks on the button, scroll to the top of the document
function scrollToTop() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
var recipeArray = [];
$(document).on("click", ".recipe-click", function() {
  // Firebase Click Counter
  // =============================================================================================
  // This takes the recipe title and stores it into a variable
  var recipeName = $(this).attr("data-title");
  // this takes whatever the number of clicks is on this particular item
  var clicks = parseInt($(this).attr("clicks"));

  //   this runs the check on the name of the recipe to reset to 0 whenever a new name comes
  function recipeNameCheck() {
    var check = recipeArray.indexOf(recipeName);
    console.log({ check });
    if (recipeArray.indexOf(recipeName) === -1) {
      clickCounter = 0;
    } else {
      clickCounter = clicks;
      clickCounter++;
    }
  }
  // this is runs the function
  recipeNameCheck();

  // this puts the value onto the element
  $(this).attr("clicks", clickCounter++);

  //   this is the array holding all the recipe names
  recipeArray.push(recipeName);

  //   this calls the firebase Database and sets the names and recipes to it
  database.ref().push({
    recipe: [recipeName, clickCounter]
  });
  // ===============================================================================================

  var recipeTitle = $(this).attr("data-title");

  // Youtube API
  // ========================================================================

  //  This code loads the IFrame Player API code asynchronously.
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var videoId;

  //  This code runs the Youtube API
  var queryURL =
    "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" +
    recipeTitle +
    "+recipe&type=video&key=AIzaSyCAEPxkCXWQX98Gly2feoCysKATNaLs-1s";

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    videoId = response.items[0].id.videoId;
    onYouTubeIframeAPIReady(videoId, player);
  });

  // This is the youtube player embeded with the video
  var player;
  function onYouTubeIframeAPIReady(videoId, player) {
    player = new YT.Player("player", {
      height: "200",
      width: "400",
      videoId: videoId,
      events: {
        onReady: onPlayerReady
      }
    });
  }

  // This is plays the video as soon as you open the modal
  function onPlayerReady(event) {
    event.target.playVideo();
  }

  //   This stops the video when we close the modal
  $(".closed").on("click", function() {
    $("#player").remove();
    $("#removal").remove();

    divPlayer = $("<div>");
    divPlayer.attr("id", "player");

    $("#single-display-modal").append(divPlayer);
  });

  // =============================================================================
  // $("#single-recipe").html("");
  $("#singleRecipeModTitle").html("");

  var singleRecipeDiv = $("<div>");
  singleRecipeDiv.addClass("container");
  singleRecipeDiv.attr("id", "removal");

  var singleRecipeImage = $("<div>");
  singleRecipeImage.addClass("col-md-12 modal-image");
  singleRecipeImage.css({
    "background-image": "url(" + $(this).attr("data-image") + ")"
  });

  var ingredientList = $("<ul>");
  var ingredientsArray = JSON.parse($(this).attr("data-ingredientsData"));

  for (i = 0; i < ingredientsArray.length; i++) {
    // var addToShoppingList = $("<button>+</button>");
    // addToShoppingList.text("+");
    // addToShoppingList.addClass("add-to-shopping-list")
    var listItem = $("<li id='add-to-shopping'>");
    listItem.attr("data-ingredientText", ingredientsArray[i].text);
    listItem.append(
      "<button class='btn btn-secondary m-1'>+</button>" +
        ingredientsArray[i].text
    );

    // console.log("data-ingredientText" + ingredientsArray[i].text)
    ingredientList.append(listItem);
    // ingredientList.append(addToShoppingList);
  }

  var singleRecipeYield = $("<p>").text(
    "This recipe yields " + $(this).attr("data-yield") + " servings"
  );
  var singleRecipeCalPerS = $("<p>").text(
    "Calories per Serving: " + $(this).attr("data-caloriesperserv")
  );
  var singleRecipeDietLabel = $("<p>").text(
    "Diet Labels: " + $(this).attr("data-dietLabel")
  );
  var singleRecipeHealthLabel = $("<p>").text(
    "Health Labels: " + $(this).attr("data-healthLabel")
  );
  console.log($(this).attr("data-totalNutrients"));
  var singleRecipetotalNutrients = $("<ul>");
  singleRecipetotalNutrients.html($(this).attr("data-totalNutrients"));

  var singleRecipeLinkToInstructions = $("<p>").html(
    "<a href=" +
      $(this).attr("data-linkToInstructions") +
      " target='_blank'>Link to full instructions</a>"
  );

  // singleRecipeIngredients.attr("id", "click-ingredients");
  // singleRecipeIngredients.attr("data-ingredientsToFav", ingredientsToFavorite);

  singleRecipeDiv.append(singleRecipeImage);
  singleRecipeDiv.append(ingredientList);
  singleRecipeDiv.append(singleRecipeYield);
  singleRecipeDiv.append(singleRecipeCalPerS);
  singleRecipeDiv.append(singleRecipeDietLabel);
  singleRecipeDiv.append(singleRecipeHealthLabel);
  singleRecipeDiv.append(singleRecipetotalNutrients);
  singleRecipeDiv.append(singleRecipeLinkToInstructions);

  $("#single-display-modal").append(singleRecipeDiv);

  $("#singleRecipeModTitle").text($(this).attr("data-title"));
  // console.log("ingredients to favorite: " + ingredientsToFavorite);
});

var shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
if (shoppingList === null) {
  shoppingList = [];
}

function renderShoppingList() {
  $("#bookmark-list").empty();
  for (i = 0; i < shoppingList.length; i++) {
    var shoppingContainer = $("<figure>");

    var deleteItem = $("<button>");
    deleteItem.addClass("btn btn-secondary");
    deleteItem.attr("data-index", i);
    deleteItem.text("-");
    deleteItem.addClass("delete");

    shoppingContainer.append(shoppingList[i] + "<br>");
    shoppingContainer.append(deleteItem);
    $("#bookmark-list").prepend(shoppingContainer);
  }
}

renderShoppingList();

$(document).on("click", "#add-to-shopping", function() {
  // console.log($(this))
  // console.log("data attr: " + $(this).attr("data-ingredientText"));
  event.preventDefault();

  var shoppingItem = $(this).attr("data-ingredientText");

  // var newItem = {
  //     name: shoppingItem
  // }

  shoppingList.push(shoppingItem);
  renderShoppingList();
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
});

$(document).on("click", ".delete", function() {
  var index = $(this).attr("data-index");
  shoppingList.splice(index, 1);
  renderShoppingList();
  localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
});

// Firebase
// ================================================================================

// The Firebase configuration
var config = {
  apiKey: "AIzaSyCEy9bC6uS5eeI8oijSHGQ-Anw0iT_2hLc",
  authDomain: "myawesomeproject-10537.firebaseapp.com",
  databaseURL: "https://myawesomeproject-10537.firebaseio.com",
  projectId: "myawesomeproject-10537",
  storageBucket: "myawesomeproject-10537.appspot.com",
  messagingSenderId: "96513436362"
};
firebase.initializeApp(config);

// Variables
// =====================================
// Get a reference to the database service
var database = firebase.database();
