var baseUrl = "http://localhost:8082";
function toonAlleMealPlans() {
    getRequest(printAllMealPlans, "allmealplans");
}
function getRequest(callback, url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        //                console.log(this.responseText);
        if (this.readyState == 4) {
            var result = JSON.parse(this.responseText);
            callback(result);
        }
    }
    console.log("Ik roep nu aan: ", baseUrl + "/" + url)
    xhr.open("get", baseUrl + "/" + url, true);
    xhr.send();
}
function printAllMealPlans(mealPlans) {
    gebi("toonMealplans").innerHTML = "";
    console.log(mealPlans);
    mealPlans.forEach(element => gebi("toonMealplans").innerHTML += "<br>" + element.start + htmlDetailButton(element));
}
function htmlDetailButton(mealPlan) {
    return `<button onclick=gaNaarDetailsMealPlan(${mealPlan.id})> Details </button>`;
}
function maakMealPlanAan() {
    var mealPlan = {};
    mealPlan.start = gebi("startdate").value;
    mealPlan.end = gebi("enddate").value;
    mealPlanJSON = JSON.stringify(mealPlan);
    postObject(mealPlanJSON, "addmealplan");
}
function postObject(objJSON, url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        console.log(this.responseText);
		var responseAsJson = JSON.parse(this.responseText);
		gaNaarDetailsMealPlan(responseAsJson.id)
    }
    xhr.open("post", baseUrl + "/" + url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(objJSON);
}
function gebi(id) {
    return document.getElementById(id);
}
function gaNaarDetailsMealPlan(mealPlanId) {
    console.log(mealPlanId);
    window.location = "./mealplan.html?id=" + mealPlanId

}
function editMeal() {
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get("mealid");
    const mealDate = urlParams.get("date");
    const mealType = urlParams.get("mealtype").toLowerCase();
    const mealPlanId = urlParams.get("mealplanid");
    getAllRecipesForMeal(mealType);

    document.getElementById("meal-date").innerHTML = mealDate;
    document.getElementById("meal-meal-type").innerHTML = mealType;

}

async function saveRecipeToMeal() {
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = urlParams.get("mealid");
    const mealDate = urlParams.get("date");
    const mealType = urlParams.get("mealtype").toLowerCase();
    const mealPlanId = urlParams.get("mealplanid");

    const recipes = document.getElementsByClassName('recipe-id');
    // console.log(recipes);

    var editedMeal = {};
    editedMeal.date = mealDate;
    editedMeal.id = parseInt(mealId);
    editedMeal.mealType = mealType;

    editedMeal.servings = parseInt(gebi("servings-amount").value);

    let nameArray = []
    for (recipe of recipes) {
        recipeName = recipe.innerText;
        console.log(recipeName);
        nameArray.push(recipeName);
    }

    editedMeal.recipes = await findRecipesByNameForMeal(nameArray);
    console.log(editedMeal);

    var editedMealJson = JSON.stringify(editedMeal)

}

function addRecipeToMeal(recipe) {

    gebi("added-recipes").innerHTML += `
    <tr>
        <td class="recipe-id">
           ${recipe}
        </td>
        <td>
           
        </td>
    </tr>
    `;
}

async function findMealById(mealId) {
    const response = await fetch(baseUrl + "/findmealbyid/" + mealId);
    const meal = await response.json();

    return meal;
}

async function findRecipesByNameForMeal(recipeNames) {
    // console.log(recipeNames);
    const response = await fetch(baseUrl + "/findrecipesbynames", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(recipeNames)
    });
    return await response.json();

}


async function getAllRecipesForMeal(mealType) {
    const response = await fetch(baseUrl + "/findrecipesbymealtype/" + mealType);
    const recipes = await response.json();

    document.getElementById("table-add-recipe").innerHTML = `
    <tr>
        <td id="recipe-list-table-row">
            <input type="text" class="random-class-name" list="recipelist" name="recipe" id="recipe-list-for-meal"></input>
            <datalist id="recipelist"></datalist>
        </td>
        <td id="add-recipe-to-meal-btn">
            <button class="btn btn-info" id="add-recipe-btn">add recipe</button>
        </td>
    </tr>
       
    `
    gebi("add-recipe-btn").addEventListener("click", (event) => {
        var recipe = gebi("recipe-list-for-meal").value;
        // console.log(recipe);
        addRecipeToMeal(recipe);
    })

    let optionsString = "";
    recipes.forEach(recipe => {
        optionsString += `<option value="${recipe.name}"></option>`;
    }
    )
    gebi("recipelist").innerHTML = optionsString;
}
