// Sürekli kullanacağımız fonskiyonları da bu modülde tutuyoruz.



import {TIMEOUT_SEC} from "./config.js"



// This function returns a promise and reject after a some seconds
const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
  };

export const AJAX = async function(url, uploadData = undefined,) {
  
  
  try {

  const fetchPro = uploadData ? fetch(url, {
    method: "POST",
    headers:{
      "Content-Type" : "application/json",
    },
    body: JSON.stringify(uploadData)
  }) : fetch(url) ;

    // fonksiyona id parametresini ekliyoruz çünkü altta id nerden çekecek bilmiyor onlar ilgili kısım 
    // controller da kaldı şuan.
    // this fetch funtion will return the promise. We use async function so we can wait till the promise come.
    // Burda 2 tane promisi race methodu ile yarışa soktuk, serverdan datanın geç gelmesi durumları için 
    // bunu yapıyoruz. timout belirlenen saniye kadar bekleyecek, eğer fetchden data gelmez ise 
    // timeout çalışacak
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    // now it will come promise so we need to convert it to json format to read.

    const data = await res.json();
    // json method are available all the response objects. it returns promise again.
    //  response is an object from a web request initiated by fetch().
    // fetch den gelen datanın sorunlu olup olmadğına içindeki ok propertisine bakarak anlıyoruz.
    // eğer true ise sorun yok false ise bir sorun var demek.
    

    // Eğer fetch de sorun var ilgili hatayı alert olarak ekran veriyoruz.
    if(!res.ok) throw new Error (`${data.message} ${res.status}`);
    return data;

    }catch(err) {
      console.log(err);    
      throw err
    }
}


/*
export const getJSON = async function(url){
    try {
    // fonksiyona id parametresini ekliyoruz çünkü altta id nerden çekecek bilmiyor onlar ilgili kısım 
    // controller da kaldı şuan.
    // this fetch funtion will return the promise. We use async function so we can wait till the promise come.
    // Burda 2 tane promisi race methodu ile yarışa soktuk, serverdan datanın geç gelmesi durumları için 
    // bunu yapıyoruz. timout belirlenen saniye kadar bekleyecek, eğer fetchden data gelmez ise 
    // timeout çalışacak
    const fetchPro = fetch(url)
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    // now it will come promise so we need to convert it to json format to read.

    const data = await res.json();
    // json method are available all the response objects. it returns promise again.
    //  response is an object from a web request initiated by fetch().
    // fetch den gelen datanın sorunlu olup olmadğına içindeki ok propertisine bakarak anlıyoruz.
    // eğer true ise sorun yok false ise bir sorun var demek.
    

    // Eğer fetch de sorun var ilgili hatayı alert olarak ekran veriyoruz.
    if(!res.ok) throw new Error (`${data.message} ${res.status}`);
    return data;

    }catch(err) {
      console.log(err);    
      throw err
    }

}



export const sendJSON = async function(url, uploadData){
  try {

  const fetchPro = fetch(url, {
    method: "POST",
    headers:{
      "Content-Type" : "application/json",
    },
    body: JSON.stringify(uploadData)
  });
  const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])

  const data = await res.json();


  if(!res.ok) throw new Error (`${data.message} ${res.status}`);
  return data;

  }catch(err) {
    console.log(err);    
    throw err
  }

}

*/ 