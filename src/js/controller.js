
// We need architecture of this project. There 3 reasons of it. 
// 1-)  Structure - we need to organize cood.
// 2-) Maintainbaility - a project is never done. easilty change it in future
// 3-) Expandability - we may want to add new features later.

// Bu modül view ve model arasında köprü vazifesi görmekte ve bir okestra şefi gibi görev dağılımlarını yapmakta ve ilgili handler dan sorumludur.


// recipeView den classı çektik.
import recipeView from "./views/recipeView.js"

// Bu model ürettiğimiz şeyler buraya çekmemizi sağlıyor, state ve loadrecipe fonksiyonu gibi.
import * as model from "./model.js"

import { MODAL_CLOSE_SEC } from "./config.js"


// Bunları polyfilin yani eski browserlarda çalışması için aldık, onlar için convert ediyorlar.
import "core-js/stable";
import "regenerator-runtime/runtime";



import searchView from "./views/searchView.js"
import resultsView from "./views/resultsView.js"
import bookmarksView from "./views/bookmarksView.js"
import paginationView from "./views/paginationView.js"
import addRecipeView from "./views/addRecipeView.js"



// if (module.hot) {
 // module.hot.accept();
//}


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////


// we use async function we will not block the main thread, it will work in background.
//  the asynchronous method returns a promise to supply the value at some point in the future.
const controlRecipes = async function () {
  try {

    // her result recipenin bir hash kodu var, linklere yerleştirilmiş. Tıkladıkça hashler dğeişiyor
    // bizde bunlara addeventlistener ekledik ve her hash değiştiridde çalışması için..
    // hash değişirken bunu alıp ayrıca fetch in içine koyduk çünkü her recipe ayrı bir hash koduna sahip ve bu kodlara göre fetch ediyoruz.


    // bu alttaki kodu modal a almıyoruz çünkü bu kısım projenin çalışması ile ilgili. business logic ile alakası yok.
    const id = window.location.hash.slice(1);


    // Guard close diyoruz buna eğer id yok ise aşağıdakileri çalıştırma demek oluyor. Oldukça kullanışlı 
    // iyi bilmekte fayda var.
    if(!id) return;
    
    
     // aşağıda fetch data bunu override edene kadar spinner ekliyor. Css animationu aslında
     // dom ile içeri atılıyor. Aşağıda data gelince, render methodu tekrardan ilgili elemnti 
     // içini boşaltıyor ve kendi markupını yerleştiriyor..
     recipeView.renderSpinner();

  //////////////// ---------- 0) Update results view to mark selected result --------------////////
     resultsView.update(model.getSearchResultsPage());

    


  //////////////// ---------- 1) LOADING RECIPE --------------////////

    // fetch kısmını modal da yaptık. Alttaki fonksiyon fetct yapıp datayı düzenleyip, state.recipe kımsını 
    // ekliyor. Bu fonksiyon fetch yaptığı için kodu bloklamamazı lazım o yüzden await keyworudnu yine
    // ekliyoruz 
     await model.loadRecipe(id);
    // Pekala şimdi yukardaki fonskiyon sadece state.recipe manipule etti. Şimdi o datayı kullanmamız lazım.


  //////////////// ---------- 2) RENDERING RECIPE --------------////////

    // Bu metodu birazdan recipeView klasında tanımlayacağız. İsmini render koyduk oldukça common name 
    // bu işler için. React'da falan da bu isimde kullanılıyor.
     recipeView.render(model.state.recipe);


    
  }catch(err) {
    console.log(err);
    recipeView.renderError();
  }

};

// Bu fonksiyon submit kısmından ilgili query , query değişkenine assign ediyor. Ardından loadsearchresults ile state.search.results kısmına sonuçları yerleştiriyor. 
const controlSearchResults = async function() {
  try {

    resultsView.renderSpinner();
    // 1) Get Search Query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render Results 
    resultsView.render(model.getSearchResultsPage(1));

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search)


// Updating bookmarks view.
    bookmarksView.update(model.state.bookmarks)

  }catch(err) {
    console.log(err);
  }
}


const controlPagination = function(goToPage) {

  // 1) Render New Results 
  resultsView.render(model.getSearchResultsPage(goToPage));

    // 3) Render Bookmarks
    bookmarksView.render(model.state.bookmarks); 

  // 4) Render New  pagination buttons
  paginationView.render(model.state.search)


}

const controlServings = function(newServings) {
  // update recipe servings (in state)
  model.updateServings(newServings) 

  // update view as well.
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

const controlAddBookmark = function() {
  // 1 ) add or remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe) 
  else model.deleteBookmark(model.state.recipe.id) 

  // 2) update recipe
  recipeView.update(model.state.recipe)


}


const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
  try{

    // spinner 
    addRecipeView.renderSpinner();

  // upload the new recipe data
     await model.uploadRecipe(newRecipe);
     console.log(model.state.recipe)

     // render recipe 
     recipeView.render(model.state.recipe);

     // success message
      addRecipeView.renderMessage()

    // render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // change id in url 

    window.history.pushState(null, "", `#${model.state.recipe.id}`);

     // close form window 
     setTimeout(function() {
       addRecipeView.toggleWindow();
     }, MODAL_CLOSE_SEC * 1000)
    }catch(err) {
      console.log("----", err);
      addRecipeView.renderError(err.message);
    } 

}


// Bu kısım modül mantığı açısından oldukça önemli. Addeventlistener ları burda tutamıyoruz çünkü
// onlar view ile ilgili fakat tamamen viewe de alamıyoruz çünkü controller larda ilgili. Bu 
// sebeple publisher-subscriber pattern diye method kullanıyoruz. Ayrıca ReciperView  contrller dan
// bir fonskiyon çağırılamaz. çünkü controller diye birşer varlığından bile haberi yok bu sebeple
// controller recipevire den fonksiyon çekebilir ancak.
// Çözüm şu şekilde. RecipeView de bir method yaratıyoruz. 
// ve bu method ilgili addevent leri gerçekleştiriyor. Bizde burdan bir fonksiyon yaratıyoruz ve ona 
// callback functionı bir argument olarak veriyoruz. Burdada bu fonksiyon direk çağırılıyor.
// işin özü callback'in arguman olarak kullanılması aslında.
const init = function() {
bookmarksView.addHandlerRender(controlBookmarks)  
recipeView.addHandlerRender(controlRecipes);
recipeView.addHandlerUpdateServings(controlServings);
recipeView.addHandlerAddBookmark(controlAddBookmark);
searchView.addHandlerSearch(controlSearchResults);
paginationView.addHandlerClick(controlPagination);
addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();



