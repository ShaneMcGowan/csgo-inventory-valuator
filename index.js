let api = {
  cors: 'https://api.allorigins.win/get?url=',
  inventory: {
    base: 'http://steamcommunity.com/inventory/',
    criteria: '/730/2?l=english&count=5000'
  },
  prices: {
    opskins: 'https://api.opskins.com/IPricing/GetAllLowestListPrices/v1/?appid=730',
    bitskins: {
      base: 'https://bitskins.com/api/v1/get_price_data_for_items_on_sale/?',
      apiKey: 'api_key=',
      oauthKey: 'code='
    },
    steam: ''
  },
  profile: 'http://steamcommunity.com/id/TOILETROLLMAN/' // James' Inventory
};


window.onload = function () {

  /* On enter press for that sick UX */
  document.getElementById('btnGo').addEventListener('click', () => {
    const id = document.getElementById('tbxId').value;
    api.profile = id;
    getSteamProfile().then(response => {
      console.log(response);

      const found = false;
      if (found === true) {
        const id = document.getElementById('tbxId').value;
        window.location = `/inventory.html?id=${id}`;
      } else {
        alert('not found');
      }
    });
  });

  document.getElementById('tbxId').addEventListener('keydown', (event) => {
    if (event.which == 13 || event.keyCode == 13) {
      getUser();
      const id = document.getElementById('tbxId').value;
      window.location = `/inventory.html?id=${id}`;
      return false;
    }
    return true;
  });

  document.getElementsByClassName('arrows')[0].addEventListener('click', () => {
    smoothScroll(document.getElementById('about'));
  });

};

let getSteamProfile = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('Getting steam profile....');

    callApiXML(api.cors + api.profile + '?xml=1', (response) => {
      const xmlString = JSON.parse(response).contents;
      resolve(xmlString);
    });

  });
  return promise;
};


function callApiXML(url, callback) {
  fetch(url).then((response) => {
    return response.text();
  }).then((response) => {
    //TODO: Probably dont need this .then
    callback(response);
  });
}









