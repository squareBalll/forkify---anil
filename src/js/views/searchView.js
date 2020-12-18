
// Yine bir view dosyası yarattık düzen için. Burası search kısmından sorumlu olacak. Bir instaance yaratıp bunu contreller export ettik. 

// Öncelikle ilgili container bulup bunu parent element olarak ekledik. Ardından submit kısmındaki value almak için getquery methodunu yarattık. 

class SearchView {
    _parentEl = document.querySelector(".search");


    getQuery() {
        const query =  this._parentEl.querySelector(".search__field").value;
        this._clearInput();
        return query;
    }

    _clearInput() {
        this._parentEl.querySelector(".search__field").value = "";
    }


    addHandlerSearch(handler) {
        this._parentEl.addEventListener("submit", function(e){
            e.preventDefault();
            handler();
        })
    }

}

export default new SearchView();
