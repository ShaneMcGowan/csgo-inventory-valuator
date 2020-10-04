/**
 * Returns the contents of the first matching tag, if no tags found, returns null
 * @param {string} xmlString 
 * @param {string} tagName 
 */
function getTagValueFromXMLString(xmlString, tagName) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");
  const matches = xml.getElementsByTagName(tagName);
  if(matches.length === 0){
    return null;
  }

  return removeCDATA(matches[0].innerHTML);
}

/**
 * Removes XML CDATA escaping
 * @param {string} string 
 */
function removeCDATA(string) {
  return string.replace("<![CDATA[", "").replace("]]>", "");
}