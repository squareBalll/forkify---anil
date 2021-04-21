// Bu modüle presentation logic için yaratılmıştır. Ana modul View modülüdür bunlar onun alıtndaki 
//modüller/classlar olacak

import {Fraction} from "fractional"

import View from "./View.js"

// Aşağıda recipe markupında ikonlar hala eski folderı gösteriyor bu yüzden onları düzenlememiz lazım
// öncelikle icons.svg dosyasını bu dosyaya import ettik parcel sayesinde.
import icons from "url:../../img/icons.svg";







// Sonradan bunu view klasının içine alacağız. Her bu tür viewlerin hepsi kendine ait bazı methodlara
// sahip olacak bu yüzden burda class kullanmak en mantıklısı.
 class RecipeView extends View {

    // parent olacak recipe seçtik çünkü recipe için kontainer bu klass da zaten recipeview atandığı 
    // için oldukça tutarlı bir mantık, ayrıca spinner vs içinde bu parentı kullanacağız.
    _parentElement = document.querySelector('.recipe');
    _errorMessage = "We could not find that recipe. Please try another one!";
    _message = "";






    // Show recipe fonksiyonu bize aslında reicpe gösteriyor. Bu fonksiypnu belli addeventlistenera ekledik.  
    // Resultlar link içinde hash kodlarına sahip. Bunlara her tıkladığında hash kodunu değiştiriyorlar ve bizde bu değişime event ekleyerek showrecipe call back function çağırıyor. Aynı şekilde sayfa yüklenirken de yapıyoruz.
    // Load eventi ise eğer aynı linki alıp başka sayfaya koyarsak showrecipe çağırılmıyor çünkü has değişmedi. 
    // bu yüzden bizde ayrıca load eventine de showrecipe çağırıyıoruz.

    // Bu method publisher and needs to access to subscriber
    addHandlerRender(handler) {
      window.addEventListener("hashchange", handler);
      window.addEventListener("load", handler);
    }

    addHandlerUpdateServings(handler) {
      this._parentElement.addEventListener("click",function(e) {
        const btn = e.target.closest(".btn--update-servings");
        if(!btn) return;
        const {updateTo} = btn.dataset
        if(+updateTo > 0) handler(+updateTo);
      })
    }

    addHandlerAddBookmark(handler) {
      this._parentElement.addEventListener("click", function(e) {
        const btn = e.target.closest(".btn--bookmark")
        if(!btn) return;
        handler();

      })
    }




    // Bu fonksiyonun direk return etmesini istiyoruz bu yüzden return'e ilgili dom u yerleştirdik.
    // Biz fonksiyonu render içinde çalıştarağız bu yüzden recipe datasının olduğu path arguman olarak 
    // render içine yerleştirilcek ve bizde ordan çekerek alttaki koda ekleyeceğimi bu yüzden
    // this.#data yazdık çünkü renderin ilk kodunda recipe pathini direk bu dataya assign ettik.
    _generateMarkup() {
        
        // Recipe objesini hmtl yedirmek için bunu yapıyoruz. RENDER deniyor.
        // sonra bunu injectHTML methodu ile HTML yollucaz.
        return  `
        <figure class="recipe__fig">
            <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
            <h1 class="recipe__title">
              <span>${this._data.title}</span>
            </h1>
        </figure>
        
        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
            <span class="recipe__info-text">servings</span>
        
            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>
        
          <div class="recipe__user-generated ${this._data.key ? "" : "hidden"}">
             <svg>
               <use href="${icons}#icon-user"></use>
             </svg>
          </div>
          <button class="btn--round btn--bookmark">
            <svg class="">
              <use href="${icons}#icon-bookmark${this._data.bookmarked ? "-fill" : "" }"></use>
            </svg>
          </button>
        </div>
        
        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
           
            ${this._data.ingredients.map(this._generateMarkupIngredient).join("")}
          
          </ul>
        </div>
        
        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">${this._data.publisher}</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${this._data.sourceUrl}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
        `;
         
    }

    // Burda ingredientları ayrı bir yere aldık, bunu üstte map methodunun içine atıyoruz.
    _generateMarkupIngredient(ing)  {
      return ` 
         <li class="recipe__ingredient">
            <svg class="recipe__icon">
              <use href="${icons}#icon-check"></use>
            </svg>
            <div class="recipe__quantity">${ing.quantity ? new Fraction(ing.quantity).toString() : ""}</div>
            <div class="recipe__description">
              <span class="recipe__unit">${ing.unit}</span>
              ${ing.description}
            </div>
         </li>
      `
    }


}


// we dont pass any data in so therefore we dont need any contructe even. Bu exportu tamamen yukarda bu class için tanımladığımız methodları controller da kullanmak için yapıyoruz.
export default new RecipeView() 