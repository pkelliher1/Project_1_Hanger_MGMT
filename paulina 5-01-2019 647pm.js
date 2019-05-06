var recipeDiv;

if ($(".form-control ingredient").val() === "") {
  alert("type in something in the search field");
}

$("#search-form").on("submit", function(event) {
  event.preventDefault();
  $("#recipe-results").html("");

  var searchIngredient = $("#ingredient").val();
  var resultsQuantity = $("#results-quantity").val();

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

  // var cuisineArray=[];
  // var cuisineString = "";
  // $.each($(".cuisine:checked"), function() {
  //     cuisineArray.push($(this).val());
  //     cuisineString = "&cuisine=" + cuisineArray.join("&cuisine=")
  // })

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
          "<p> " + response.hits[i].recipe.totalNutrients[m].label;
        totalNutrients +=
          " " + Math.round(response.hits[i].recipe.totalNutrients[m].quantity);
        totalNutrients +=
          " " + response.hits[i].recipe.totalNutrients[m].unit + "</p>";
        // console.log("m: " + m);
      }

      var recipeYield = response.hits[i].recipe.yield;

      var linkToInstructions = response.hits[i].recipe.url;

      var recipeDiv = $("<div>");

      var recipeImage = $("<img>");
      recipeImage.attr("src", response.hits[i].recipe.image);

      recipeDiv.attr("class", "recipe-click");
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

      var title = $("<p>").text("Title: " + recipeTitle);
      var arrayOfIngredients = $("<p>").text("Ingredients: " + ingredients);
      var displayCaloriesPerServing = $("<p>").text(
        "Calories per Serving: " + caloriesPerServing
      );

      recipeDiv.append(recipeImage);
      recipeDiv.append(title);
      recipeDiv.append(arrayOfIngredients);
      recipeDiv.append(displayCaloriesPerServing);

      $("#recipe-results").append(recipeDiv);
    }
  });

  this.reset();
});

$(document).on("click", ".recipe-click", function() {
  var recipeTitle = $(this).attr("data-title");
  // Youtube API
  // ========================================================================
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var videoId;

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
    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
  });

  // 4. The API will call this function when the video player is ready.
  function onPlayerReady(event) {
    event.target.playVideo();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
      done = true;
    }
  }

  var player;
  function onYouTubeIframeAPIReady(videoId, player) {
    player = new YT.Player("player", {
      height: "390",
      width: "640",
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  }
  // =============================================================================

  $("#single-recipe").html("");
  var singleRecipeDiv = $("<div>");

  var singleRecipeImage = $("<img>");
  singleRecipeImage.attr("src", $(this).attr("data-image"));

  var singleRecipeTitle = $("<p>").text(
    "Recipe title: " + $(this).attr("data-title")
  );

  var ingredientList = $("<ul>");
  var ingredientsArray = JSON.parse($(this).attr("data-ingredientsData"));

  for (i = 0; i < ingredientsArray.length; i++) {
    // var addToShoppingList = $("<button>+</button>");
    // addToShoppingList.text("+");
    // addToShoppingList.addClass("add-to-shopping-list")
    var listItem = $("<li id='add-to-shopping'>");
    listItem.attr("data-ingredientText", ingredientsArray[i].text);
    listItem.append("<button>+</button>" + ingredientsArray[i].text);

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
  var singleRecipetotalNutrients = $("<p>").html(
    "Total Nutrients: " + $(this).attr("data-totalNutrients")
  );
  var singleRecipeLinkToInstructions = $("<p>").html(
    "<a href=" +
      $(this).attr("data-linkToInstructions") +
      " target='_blank'>Link to full instructions</a>"
  );

  // singleRecipeIngredients.attr("id", "click-ingredients");
  // singleRecipeIngredients.attr("data-ingredientsToFav", ingredientsToFavorite);

  singleRecipeDiv.append(singleRecipeImage);
  singleRecipeDiv.append(singleRecipeTitle);
  singleRecipeDiv.append(ingredientList);
  singleRecipeDiv.append(singleRecipeYield);
  singleRecipeDiv.append(singleRecipeCalPerS);
  singleRecipeDiv.append(singleRecipeDietLabel);
  singleRecipeDiv.append(singleRecipeHealthLabel);
  singleRecipeDiv.append(singleRecipetotalNutrients);
  singleRecipeDiv.append(singleRecipeLinkToInstructions);

  $("#single-recipe").append(singleRecipeDiv);
  // console.log("ingredients to favorite: " + ingredientsToFavorite);
});

var shoppingList = JSON.parse(localStorage.getItem("shoppingList"));
if (shoppingList === null) {
  shoppingList = [];
}

function renderShoppingList() {
  $("#shopping-list").empty();
  for (i = 0; i < shoppingList.length; i++) {
    var shoppingContainer = $("<figure>");

    var deleteItem = $("<button>");
    deleteItem.attr("data-index", i);
    deleteItem.text("-");
    deleteItem.addClass("delete");

    shoppingContainer.append(shoppingList[i] + "<br>");
    shoppingContainer.append(deleteItem);
    $("#shopping-list").prepend(shoppingContainer);
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
