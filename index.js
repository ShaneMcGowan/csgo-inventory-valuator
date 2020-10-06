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

let submitting = false;

window.onload = function () {

  /* On enter press for that sick UX */
  document.getElementById('btnGo').addEventListener('click', () => {
    onFormSubmit();
  });

  document.getElementById('tbxId').addEventListener('keydown', (event) => {
    if (event.which == 13 || event.keyCode == 13) {
      onFormSubmit();
      return false;
    }
    return true;
  });

  document.getElementsByClassName('arrows')[0].addEventListener('click', () => {
    smoothScroll(document.getElementById('about'));
  });

};

function getSteamProfile() {
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

function navigateToInventory(steam64ID) {
  window.location.href = `/inventory.html?id=${steam64ID}`;
}

function onFormSubmit() {
  if (submitting === false) {
    // Set loading state
    addLoading();

    // Remove previous error messages
    const outputError = document.getElementById('tbxError');
    const textboxInput = document.getElementById('tbxId').parentNode;
    outputError.innerHTML = '';
    outputError.classList.add('hidden');
    textboxInput.classList.remove('input-error');

    // TODO: Loading state
    const id = document.getElementById('tbxId').value;
    api.profile = id;
    getSteamProfile().then(response => {
      const steam64ID = getTagValueFromXMLString(response, 'steamID64');

      if (steam64ID !== null) {
        navigateToInventory(steam64ID);
        submitting = false;
      } else {
        // Add Error 
        outputError.innerHTML = "Profile is either private or doesn't exist";
        outputError.classList.remove('hidden');
        textboxInput.classList.add('input-error');

        // Remove loading state
        removeLoading();
      }
    });
  }
}

function addErrors() {

}

function removeErrors() {

}

function addLoading() {
  submitting = true;

  const inputLoading = document.getElementById('inputLoading');
  const inputText = document.getElementById('tbxId').parentNode;

  inputLoading.classList.remove('hidden');
  inputText.classList.add('hidden');
}

function removeLoading() {
  submitting = false;

  const inputLoading = document.getElementById('inputLoading');
  const inputText = document.getElementById('tbxId').parentNode;

  inputLoading.classList.add('hidden');
  inputText.classList.remove('hidden');

}









