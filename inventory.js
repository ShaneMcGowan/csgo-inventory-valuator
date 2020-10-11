let inventory = {
  filtered: [],
  unfiltered: []
};
let prices = {
  opskins: null,
  steam: null,
  bitskins: null
}

let profile = {};
let types = [];

let sortByPrice = 'ascending';


window.onload = function () {

  let loadingSteamInventory = document.getElementById('loadingSteamInventory');
  let loadingOpSkinsPrices = document.getElementById('loadingOpSkinsPrices');
  let loadingSteamPrices = document.getElementById('loadingSteamPrices');
  let loadingBitSkinsPrices = document.getElementById('loadingBitSkinsPrices');

  const id = getParameterByName('id');
  const bitskins_key = getParameterByName('bitskins_key');
  const bitskins_code = getParameterByName('bitskins_code');
  console.log('id: ' + id);
  console.log('bitskins_key: ' + bitskins_key);
  console.log('bitskins_code: ' + bitskins_code);

  /**
   * Get profile
   * Get inventory
   * async get all price site values
   */

  // getPricesOpSkins()
  //   //.then(getPricesBitSkins) TODO: Move this back once the API is set up so no need for users to input their own - prices can then be loaded in once on initial load
  //   .then(getPricesSteam)

}

// From here https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

let getSteamInventory = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('Getting steam inventory....');
    loadingSteamInventory.innerHTML = 'Loading...';

    callApi(api.cors + api.inventory.base + profile.steamID64 + api.inventory.criteria, function (response) {
      loadingSteamInventory.innerHTML = 'DONE';
      resolve();
      console.log(response);
      handleSteamInventory(response);
    });

  });
  return promise;
};

let getPricesOpSkins = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('Getting OpSkins prices....');
    loadingOpSkinsPrices.innerHTML = 'Loading...';

    callApi(api.prices.opskins, function (response) {
      console.log(response);
      prices.opskins = response.response;
      loadingOpSkinsPrices.innerHTML = 'DONE';
      resolve();
    });

  });
  return promise;
};

let getPricesBitSkins = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('[TODO] Getting Bitskins prices....');
    loadingBitSkinsPrices.innerHTML = 'COMING SOON';

    let url = api.prices.bitskins.base + api.prices.bitskins.apiKey + '&' + api.prices.bitskins.oauthKey;
    console.log(url)

    callApi(url, function (response) {
      console.log(response);
      if (response.status === 'success') {
        prices.bitskins = response.data.items;
        loadingBitSkinsPrices.innerHTML = 'DONE';
        resolve();
      }
      else {
        loadingBitSkinsPrices.innerHTML = 'FAILED';
        reject();
      }
    });
    resolve();

  });
  return promise;
};

let getPricesSteam = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('[TODO] Getting Steam prices....');
    loadingSteamPrices.innerHTML = 'COMING SOON';

    /*callApi(api.prices.opskins,function(){
      resolve();
    });*/
    resolve();

  });
  return promise;
};

/** Handle Steam inventory */
function handleSteamInventory(response) {
  inventory.unfiltered = inventoryGroupItems(response);
  inventory.unfiltered = sanitiseArray(inventory.unfiltered);
  /*  Some items have different properties, eg 2 of the same skin but with different stickers, meaning they have
      the same name but have different classids. This sorts through the items that have the same name but different class ids */
  inventory.unfiltered = removeDuplicateNameEntries(inventory.unfiltered);
  /* now remove all the null rows so we have no issues when making the table */
  inventory.unfiltered = removeNullsFromArray(inventory.unfiltered);
  /* Now add the property for prices to make things easier for later */
  inventory.unfiltered = prepareItemPrice(inventory.unfiltered);
  /* once all items are in the right format, parse them into a list of types */
  getTypes(inventory.unfiltered);
}

/** groups duplicate items together */
function inventoryGroupItems(response) {

  // Count number of each item
  let tempInventory = [];
  response.assets.forEach(element => {
    let contains = { found: false, index: 0 };
    for (let i = 0; i < tempInventory.length; i++) {
      if (tempInventory[i].classid == element.classid) {
        contains.found = true;
        contains.index = i;
        break;
      }
    }
    if (contains.found) {
      tempInventory[contains.index].amount += 1;
    }
    else {
      tempInventory.push({
        classid: element.classid,
        amount: 1,
      });
    }
  });

  // add details to each item
  tempInventory.forEach(item => {
    for (let i = 0; i < response.descriptions.length; i++) {
      if (item.classid == response.descriptions[i].classid) {
        item.name = response.descriptions[i].market_hash_name;
        item.type = response.descriptions[i].type;
        item.tag_type = response.descriptions[i].tags[0].localized_tag_name;
        break;
      }
    }
  });

  return tempInventory
}
function populateTable(inventory) {
  let tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  inventory.forEach(item => {
    let tableRow = '';
    tableRow
      += '<tr>'
      + '<td>' + item.name + '</td>'
      + '<td>' + item.amount + '</td>';

    // Steam
    tableRow += '<td>';

    if (item.price.steam === 'N/A') {
      tableRow += 'N/A';
    }
    else {
      tableRow += ('$' + item.price.steam.toFixed(2));
    }

    tableRow += '</td>';

    // OpSkins
    tableRow += '<td>';
    if (item.price.opskins === 'N/A') {
      tableRow += 'N/A';
    }
    else {
      tableRow += ('$' + item.price.opskins.toFixed(2));
    }
    tableRow += '</td>';

    // BitSkins
    tableRow += '<td>';
    if (item.price.bitskins === 'N/A' || item.price.bitskins == '0.00') {
      tableRow += 'N/A';
    }
    else {
      tableRow += ('$' + item.price.bitskins);
    }
    tableRow += '</td></tr>';

    tableBody.innerHTML += tableRow;
  });
}

function populateProfile() {
  let profileImage = document.getElementById('profileImage').src = profile.avatarFull;
  let profileSteamID = document.getElementById('profileSteamID').innerHTML += profile.steamID;
  let profileSteamID64 = document.getElementById('profileSteamID64').innerHTML += profile.steamID64;
  let profileSteamCustomURL = document.getElementById('profileSteamCustomURL').innerHTML += profile.customURL;
  let profileVacBanned = document.getElementById('profileVacBanned').innerHTML += profile.vacBanned;
  let profileTradeBanned = document.getElementById('profileTradeBanned').innerHTML += profile.tradeBanState;
  let profileLimited = document.getElementById('profileLimited').innerHTML += profile.isLimitedAccount;
  let profileLastLogin = document.getElementById('profileLastLogin').innerHTML += profile.stateMessage;
};

function removeDuplicateNameEntries(array) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      if (array[i] != null && array[j] != null && array[i].name == array[j].name && i != j) {
        array[i].amount += array[j].amount;
        array[j] = null;
      }
    }
  }
  return array;
}

function removeNullsFromArray(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == null) {
      array.splice(i, 1)
      i--;
    }
  }
  return array;
}

function prepareItemPrice(array) {
  for (let i = 0; i < array.length; i++) {
    array[i].price = {
      bitskins: 'N/A',
      opskins: 'N/A',
      steam: 'N/A',
    }
  }
  return array;
}
/*
* Remove items such as stock skins from array that mess up the program
* TODO: should not remove them but mark as something else
*/
function sanitiseArray(array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].type.includes('Stock')) {
      array.splice(i, 1)
      i--;
    }
  }
  return array;
}
// Get different types from items for sorting
function getTypes(array) {
  array.forEach(item => {
    let contains = { found: false, index: 0 };
    for (let i = 0; i < types.length; i++) {
      if (types[i].type == item.type) {
        contains.found = true;
        contains.index = i;
        break;
      }
    }
    if (contains.found) {
      types[contains.index].amount += item.amount;
    }
    else {
      types.push({
        type: item.type,
        amount: item.amount,
      });
    }
  });
  parseTypes();
}
// 
function parseTypes() {
  console.log(types);
  let parsedTypes = {
    All: 0,
    StatTrak: 0,
    Sticker: 0,
    Graffiti: 0,
    Container: 0,
    Knife: 0,
    Gloves: 0,
    Skins: 0,
    Keys: 0
  };

  types.forEach(type => {
    /* Extra Filters */
    let name = type.type;
    parsedTypes.All += type.amount;

    if (name.includes('StatTrak')) {
      parsedTypes.StatTrak += type.amount;
    }

    /* Type Filters */
    if (name.includes('Sticker')) {
      parsedTypes.Sticker += type.amount;
      return;
    }
    else if (name.includes('Graffiti')) {
      parsedTypes.Graffiti += type.amount;
      return;
    }
    else if (name.includes('Container')) {
      parsedTypes.Container += type.amount;
      return;
    }
    else if (name.includes('Knife')) {
      parsedTypes.Knife += type.amount;
      return;
    }
    else if (name.includes('Gloves')) {
      parsedTypes.Gloves += type.amount;
      return;
    }
    else if (name.includes('Key')) {
      parsedTypes.Keys += type.amount;
      return;
    }
    else if (
      name.includes('Sniper Rifle')
      || name.includes('Rifle')
      || name.includes('Pistol')
      || name.includes('SMG')
      || name.includes('Machinegun')
      || name.includes('Shotgun')
    ) {
      parsedTypes.Skins += type.amount;
      return;
    }
  });

  types = parsedTypes;
}

// print types onto screen, setting up click events for sorting
function printTypes() {
  let typeArea = document.getElementById('types');
  let print = function (type) {
    filterInventory(type);
    populateTable(inventory.filtered);
  }
  // Add items to filter list
  typeArea.innerHTML += '<span id="typeAll"> All - ' + types.All + '</span>';
  typeArea.innerHTML += '<span id="typeStatTrak"> StatTrak™ - ' + types.StatTrak + '</span>';
  typeArea.innerHTML += '<span id="typeKeys"> Keys - ' + types.Keys + '</span>';
  typeArea.innerHTML += '<span id="typeSkins"> Skins - ' + types.Skins + '</span>';
  typeArea.innerHTML += '<span id="typeKnife"> Knives - ' + types.Knife + '</span>';
  typeArea.innerHTML += '<span id="typeGloves"> Gloves - ' + types.Gloves + '</span>';
  typeArea.innerHTML += '<span id="typeSticker"> Sticker - ' + types.Sticker + '</span>';
  typeArea.innerHTML += '<span id="typeGraffiti"> Graffiti - ' + types.Graffiti + '</span>';
  typeArea.innerHTML += '<span id="typeContainer"> Container - ' + types.Container + '</span>';
  // Event Listeners
  document.getElementById('typeAll').addEventListener('click', function () { print('All') }, false);
  document.getElementById('typeStatTrak').addEventListener('click', function () { print('StatTrak') }, false);
  document.getElementById('typeKeys').addEventListener('click', function () { print('Key') }, false);
  document.getElementById('typeKnife').addEventListener('click', function () { print('Knife') }, false);
  document.getElementById('typeGloves').addEventListener('click', function () { print('Gloves') }, false);
  document.getElementById('typeSticker').addEventListener('click', function () { print('Sticker') }, false);
  document.getElementById('typeGraffiti').addEventListener('click', function () { print('Graffiti') }, false);
  document.getElementById('typeContainer').addEventListener('click', function () { print('Container') }, false);
}

// sort types by amount 
function sortTypesAmount(order) {
  let compare;
  if (order == 'ascending') {
    compare = function (a, b) {
      if (a.amount < b.amount)
        return -1;
      if (a.amount > b.amount)
        return 1;
      return 0;
    }
    types.sort(compare);
  }
  else if (order == 'descending') {
    compare = function (a, b) {
      if (a.amount < b.amount)
        return 1;
      if (a.amount > b.amount)
        return -1;
      return 0;
    }
    types.sort(compare);
  }
  else {
    alert('Yo, enter a correct value for sorting types friend');
  }
}

// sort by price
function sortInventoryByPrice() {
  let compare;
  //already descending, change to ascending and sort ascending
  if (sortByPrice == 'descending') {
    sortByPrice = 'ascending';
    compare = function (a, b) {
      if (a.price < b.price)
        return -1;
      if (a.price > b.price)
        return 1;
      return 0;
    }
    inventory.unfiltered.sort(compare);
  } else if (sortByPrice == 'ascending') { // already ascending, change to desecnding and sort descedning
    sortByPrice = 'descending';
    compare = function (a, b) {
      if (a.price < b.price)
        return 1;
      if (a.price > b.price)
        return -1;
      return 0;
    }
    inventory.unfiltered.sort(compare);
  } else {
    alert('Yo, value wrong for sorting prices friend');
  }
}

function updatePricesOpSkins() {
  console.log(inventory.unfiltered);
  inventory.unfiltered.forEach(item => {
    // TODO: Graffiti messes this up
    try {
      item.price.opskins = (prices.opskins[item.name].price / 100);
    }
    catch (e) {
      // shout out to cathal
    }
  });
}
// TODO:
function updatePricesBitSkins() {
  console.log(inventory.unfiltered);
  inventory.unfiltered.forEach(item => {
    let found = false;
    for (let i = 0; i < prices.bitskins.length; i++) {
      if (prices.bitskins[i].market_hash_name === item.name) {
        item.price.bitskins = prices.bitskins[i].lowest_price;
        found = true;
        break;
      }
    }

    if (!found) {
      // maybe handle something here
    }
  });
}
// TODO:
function updatePricesSteam() {
}


// filter items by type
function filterInventory(type) {
  inventory.filtered = [];
  if (type == 'All') {
    inventory.unfiltered.forEach(item => {
      inventory.filtered.push(item);
    });
  }
  else {
    inventory.unfiltered.forEach(item => {
      if (item.type.includes(type)) {
        inventory.filtered.push(item);
      }
    });
  }
}

function parseProfileXML(xmlString) {
  let parser = new DOMParser();
  let xml = parser.parseFromString(xmlString, "text/xml");
  profile.steamID64 = removeCDATA(xml.getElementsByTagName("steamID64")[0].innerHTML);
  profile.steamID = removeCDATA(xml.getElementsByTagName("steamID")[0].innerHTML);
  profile.stateMessage = removeCDATA(xml.getElementsByTagName("stateMessage")[0].innerHTML);
  profile.vacBanned = removeCDATA(xml.getElementsByTagName("vacBanned")[0].innerHTML);
  profile.tradeBanState = removeCDATA(xml.getElementsByTagName("tradeBanState")[0].innerHTML);
  profile.isLimitedAccount = removeCDATA(xml.getElementsByTagName("isLimitedAccount")[0].innerHTML);
  profile.customURL = ''; // = removeCDATA(xml.getElementsByTagName("customURL")[0].innerHTML);
  profile.avatarFull = removeCDATA(xml.getElementsByTagName("avatarFull")[0].innerHTML);
}

function removeCDATA(string) {
  return string.replace("<![CDATA[", "").replace("]]>", "");
}

let buildProfile = function () {
  let promise = new Promise(function (resolve, reject) {
    console.log('Building profile....');
    updatePricesOpSkins();
    updatePricesBitSkins();
    // TODO: updatePricesSteam();
    printTypes();
    populateTable(inventory.unfiltered)
    resolve();

  });
  return promise;
};

function callApi(url, callback) {
  fetch(url).then(function (response) {
    return response.json();
  }).then(function (response) {
    callback(response);
  });
}

function callApiXML(url, callback) {
  fetch(url).then(function (response) {
    return response.text();
  }).then(function (response) {
    //TODO: Probably dont need this .then
    callback(response);
  });
}

function getUser() {
  // Get profile
  // TODO: API key and OAuth will be removed in future once server solution is implemented
  api.prices.bitskins.apiKey = 'api_key=' + document.getElementById('tbxBitSkinsAPIKey').value;
  api.prices.bitskins.oauthKey = 'code=' + document.getElementById('tbxBitSkinsOAuthKey').value;

  api.profile = document.getElementById('tbxId').value;
  getSteamProfile()
    // .then(getPricesBitSkins)
    // .then(getSteamInventory)
    .then(buildProfile);
}