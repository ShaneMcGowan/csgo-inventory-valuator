// All API Endpoints used and utils
// TODO: Only export things such as getSteamProfile and not actual utils
const api = {
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



export function getSteamProfile(profileURL) {
  return new Promise(function (resolve, reject) {
    callApiXML(api.cors + profileURL + '?xml=1', (response) => {
      // TODO: Parse to a json object
      const xmlString = JSON.parse(response).contents;

      // Build steam profile object
      const profile = {
        steamID64: getTagValueFromXMLString(xmlString, 'steamID64'),
        steamID: getTagValueFromXMLString(xmlString, 'steamID'),
        onlineState: getTagValueFromXMLString(xmlString, 'onlineState'),
        stateMessage: getTagValueFromXMLString(xmlString, 'stateMessage'),
        privacyState: getTagValueFromXMLString(xmlString, 'privacyState'),
        visibilityState: getTagValueFromXMLString(xmlString, 'visibilityState'),
        avatarIcon: getTagValueFromXMLString(xmlString, 'avatarIcon'),
        avatarMedium: getTagValueFromXMLString(xmlString, 'avatarMedium'),
        avatarFull: getTagValueFromXMLString(xmlString, 'avatarFull'),
        vacBanned: getTagValueFromXMLString(xmlString, 'vacBanned'),
        tradeBanState: getTagValueFromXMLString(xmlString, 'tradeBanState'),
        isLimitedAccount: getTagValueFromXMLString(xmlString, 'isLimitedAccount')
      }

      // If steamID64 is null then profile could not be retrieved
      if (profile.steamID64 !== null) {
        resolve(profile);
      } else {
        reject(new Error('Profile could not be found'));
      }
    });

  });
};

export function getSteamInventory() {

}





function callApiXML(url, callback) {
  fetch(url).then((response) => {
    return response.text();
  }).then((response) => {
    //TODO: Probably dont need this .then
    callback(response);
  });
}

function callApi(url, callback) {
  fetch(url).then(function (response) {
    return response.json();
  }).then(function (response) {
    callback(response);
  });
}

/**
 * Returns the contents of the first matching tag, if no tags found, returns null
 * @param {string} xmlString 
 * @param {string} tagName 
 */
export function getTagValueFromXMLString(xmlString, tagName) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");
  const matches = xml.getElementsByTagName(tagName);
  if (matches.length === 0) {
    return null;
  }

  return removeCDATA(matches[0].innerHTML);
}

/**
 * Removes XML CDATA escaping
 * @param {string} string 
 */
export function removeCDATA(string) {
  return string.replace("<![CDATA[", "").replace("]]>", "");
}