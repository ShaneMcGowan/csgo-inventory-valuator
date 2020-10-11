import { getSteamProfile, getTagValueFromXMLString } from './data.js';
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

function navigateToInventory(steam64ID) {
  window.location.href = `./inventory.html?`
    + `id=${steam64ID}`
    + `&bitskins_key=${api.prices.bitskins.apiKey}`
    + `&bitskins_code=${api.prices.bitskins.oauthKey}`;
}

function onFormSubmit() {
  if (submitting === false) {
    // Set loading state
    addLoading();

    // Remove previous error messages
    removeErrors();

    // Get input values
    const id = document.getElementById('tbxId').value;
    const apiKey = document.getElementById('tbxBitSkinsAPIKey').value;
    const oauthKey = document.getElementById('tbxBitSkinsOAuthKey').value;

    getSteamProfile(id)
      .then((resolved) => {
        // Navigate to inventory
        navigateToInventory(resolved.steamID64);
        submitting = false;
      }, (rejected) => {
        // Add Error 
        addErrors("Profile is either private or doesn't exist");
      })
      .finally(() => {
        // Remove loading state
        removeLoading();
      });
  }
}

function addErrors(errorMessage = 'An error has occured, please try again later') {
  const outputError = document.getElementById('tbxError');
  const textboxInput = document.getElementById('tbxId').parentNode;

  outputError.innerHTML = errorMessage;
  outputError.classList.remove('hidden');
  textboxInput.classList.add('input-error');
}

function removeErrors() {
  const outputError = document.getElementById('tbxError');
  const textboxInput = document.getElementById('tbxId').parentNode;

  outputError.innerHTML = '';
  outputError.classList.add('hidden');
  textboxInput.classList.remove('input-error');
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









