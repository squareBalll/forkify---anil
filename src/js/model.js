// Modellar Business Logic, State ve HTTP Libraryden sorumludurlar. View ile bir bağlantısı
// yoktur. Özetle asıl iş işlemlerini çözerler, data store ederler ve ajax çağırmalarını 
// yaparlar.

// fetch url sini confige aldık ilerde değişebilir diye. Ordan buraya çekiyoruz.
import {API_URL, KEY} from "./config.js"

// Fetch kısmını ve data düzenlemesini helper.js e aldık. Ordan bu methodu buraya çekiyoruz.
// import {getJSON, sendJSON} from "./helper.js"
import { AJAX} from "./helper.js"
import {RES_PER_PAGE} from "./config.js"


// Data tutmak için şimdi büyük bir obje yaratıyoruz ve bunu export ediyoruz controller.js de 
// kullanabilmek için.
export const state = {
    recipe: {},
    search :{
      query: "",
      results:[],
      page:1,
      resultsPerPage:RES_PER_PAGE,
    },
    bookmarks: [],
}

const createRecipeObject = function(data) {
   // şimdi datadan recipe leri çekelim bir değişkenin içine ve bunu destructure yapalım.
   const {recipe} = data.data;

   // şimdi recipe objectini düzenleyelim 
   return  {
     id: recipe.id,
     title:recipe.title,
     publisher: recipe.publisher,
     sourceUrl : recipe.source_url,
     image:recipe.image_url,
     servings: recipe.servings,
     cookingTime : recipe.cooking_time,
     ingredients : recipe.ingredients,
     ...(recipe.key && {key: recipe.key}),
   }
}


// loadrecipe fonksiyonu fetch den gelen datayı kullanan fonksiyon.
// Bu fonksiyon bir return getirmeyecek sadece state değişkenini manipule edecek.
export const  loadRecipe = async function(id) {
    try {

    // Bu fonksiyon aslında fetch fonskiyonu sonra datayı düzenliyor ve bu datayı return ediyor.
    // burda bu datayı data değişkenine assign ettik. Çünkü aşağıda data üzerinde ilgili bilgiler
    // düzenleniyor.
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
   

   
    if(state.bookmarks.some(bookmark => bookmark.id === id ))
     state.recipe.bookmarked= true
     else state.recipe.bookmarked = false;

    }catch(err) {
        console.error(`${err}----`);
        throw err
    }  
};




// Burda öncelikle store kısmına yani state objemie search diye bir object yarattık. İçine query ve results diye iki property koyduk.  Ardından query alıp getJson methoduna koyarak datayı çektik ve bunu data değişkenine koyduk. Gelen datadan ilgili verileri reciperleri alıp map methodu ile düzenleyip, sonra bunları state deki results depomuza koyduk. Controllerdan muhtamelen state.seacrh.results kısımlarına ulaşıp data gösterecektir.
export const loadSearchResults = async function(query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title:rec.title,
        publisher: rec.publisher,
        image:rec.image_url,
        ...(rec.key && {key: rec.key}),


      }
    });
    state.search.page = 1;

  }catch (err) {
    console.error(`${err}----`);
    throw err
  }
}

export const getSearchResultsPage = function(page = state.search.page) {

  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end)

}


export const updateServings = function(newServings) {
   
  // we will update ingredients which is array and we dont want to create new array so we use forEach method.
  state.recipe.ingredients.forEach(ing =>  {
    ing.quantity = ing.quantity * newServings / state.recipe.servings;
  });
  state.recipe.servings = newServings;
}

const persistBookmarks = function() {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
  // add bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmark
  if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();


}

export const deleteBookmark = function(id) {

  // delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id)
  state.bookmarks.splice(index, 1);

    // mark current recipe as not bookmarked
  if(id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();


}

const init = function(){
  const storage = localStorage.getItem("bookmarks");
  if(storage) state.bookmarks = JSON.parse(storage);

}

init();

console.log(state.bookmarks);

const clearBookmarks = function() {
  localStorage.clear("bookmarks")
}


export const uploadRecipe = async function(newRecipe) {
  try{

  const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith("ingredient") && entry[1] !== "").map(ing => {
    const ingArr = ing[1].split(",").map(el => el.trim());
    if(ingArr.length !== 3) throw new Error("Wrong ingredient format! Please use correct format :)")
    const [quantity, unit, description] = ingArr;
    return {quantity: quantity ? +quantity: null, unit, description}
  });

  const recipe = {
    title: newRecipe.title,
    source_url:newRecipe.sourceUrl,
    image_url: newRecipe.image,
    publisher:newRecipe.publisher,
    cooking_time: +newRecipe.cookingTime,
    servings: +newRecipe.servings,
    ingredients,
  }

  const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
  state.recipe = createRecipeObject(data);
  addBookmark(state.recipe)
  console.log(data);


  }catch(err) {
    throw err;
  }

  
}