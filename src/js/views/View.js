// Aşağıda recipe markupında ikonlar hala eski folderı gösteriyor bu yüzden onları düzenlememiz lazım
// öncelikle icons.svg dosyasını bu dosyaya import ettik parcel sayesinde.
import icons from "url:../../img/icons.svg";



export default class View {

    _data;


    // public metodlara ekliyoruz burda renderı. Bu methodun argumanına düzenlenmiş/çekilmiş recipe datasını
    // koymamız gerekiyor onun şuanki lokasyonu burası:  model.state.recipe. Bu method controller da 
    // çağırılırken bu path koyulorak çağırılıyor. 
    render(data, render = true) {
        if(!data || (Array.isArray(data) && data.length === 0)) return this.renderError();
        
        // Aşağıda ilk satır ile bu pathi yukardaki public olan #data ya assign ediyoruz.
        // this class içindeki şeyler kullanmak için gerkeiyor.. 
        this._data = data;

        
        // burdada önce this ile bu clasa gelip ordan generatemarup methodunu çağırıoyruz. Direk çağıra
        //mıyoruz çünkü bu fonksiyon renderın içinde değil.
        const markup = this._generateMarkup();

        if(!render) return markup;



        // markup yerleştirmeden önce parent elementin içini sildik.
        this._clear();


        // Burda aşağıdaki generateMarkup HTML kodunu html'ye yolluyoruz. Öncelikle bu kodun içinde 
        // bulunmasını istediğimiz parent elementi seçiyoruz ki burda #parentElement ana class da belirtilmiş.
        // Sonra insertadjacentHTML methodu uyguluyoruz. afterbegin ile firstchild of parent element     
        // yapıyoruz ve sonrada içine atmayı istediğimiz değişkeni ki burda generatemarkup oluyor methodu 
        // oluyor  
        this._parentElement.insertAdjacentHTML("afterbegin", markup)
    } 


    update(data) {
      this._data = data;
      const newMarkup = this._generateMarkup();


      // array from datayı array yapmak için kullanıldı.
      const newDOM = document.createRange().createContextualFragment(newMarkup);
      const newElements = Array.from(newDOM.querySelectorAll("*"));
      const curElements = Array.from(this._parentElement.querySelectorAll("*"));

      newElements.forEach((newEl, i) => {
        const curEl = curElements[i];

        // update changed text
        if(!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== "") {
          curEl.textContent = newEl.textContent
        }

        // update changed attributes
        if(!newEl.isEqualNode(curEl)) {
          Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
          
        }
  
      });
    }

    // parent elementin içindeki şeyleri silme fonksiyonu yaratıık, bunu render da kullanacağız.
    _clear() {
        this._parentElement.innerHTML = "";
    }


    // Burda aslında fetch den data gelirken bir spinner döndürmek istiyoruz bu yüzden bunu yaptık.
    // aslında bu css animationı sadece html ekliyoruz istediğimiz elementlere. Bunu controller.js 
    // de çappırmamız lazım fetch den data gelmeden önce.
    renderSpinner() {
        const markup = `
          <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
          `
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup)
  }


    renderError(message = this._errorMessage) {
      const markup = `
            <div class="error">
              <div>
                <svg>
                  <use href="${icons}#icon-alert-triangle"></use>
                </svg>
              </div>
              <p>${message}</p>
            </div>`
  
      this._clear();
      this._parentElement.insertAdjacentHTML("afterbegin", markup)

  }


  renderMessage(message = this._message) {
    const markup = `
          <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>`

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup)

}


}