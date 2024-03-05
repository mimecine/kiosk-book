//const url = /(?:^|[\s\n]|<[^>]+>)(?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+(?![^<]*>|[^<>]*<\/)/gm
const url = /(?:^|(?![^"]*?"))((?:https?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+)/gm;


var nakedUrlRegex = /\s(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))\s/gm
var innerUrlRegex = />https?:\/\/(www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)</gm

var expression = /\s([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?)\s/gmi;
var R1 = /\s(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))[\s<.,!?]?/gmi
var R2 = />https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)</gmi



var res = 'Bla https://www.abc.com/index.html?a=b#hejs you <a href="https://duh.com?sss">https://duh.com/?sss</a> '
.replace(R1," <a href=\"$1\">$1</a> ")
.replace(R2,">$1<")

// function wrapLinks(inputString) {
//     var R1 = /\s(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))([\s<.,!?]?)/gmi
//     var R2 = />https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)</gmi
//     var R3 = /(\shref=".*"\s)/gmi
//     return inputString.replace(R1," <a href=\"$1\">$1</a>$2")
//      //.replace(R2," class=\"footnote\">$1<")
//      .replace(R3,"$1 class=\"footnote\"")
// }

function wrapLinks(inputString) {
    var R1 =
      /\s(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))([\s<.,!?]?)/gim;
      var R2 = /(\shref="[^"]+"\s?)/gmi

      return inputString
      .replaceAll(R1, ' <a href="$1">$1</a>$2')
      .replaceAll(R2, '$1 class="footnote"')
  }

console.log(wrapLinks(`<p attr=2>\nBla https://www.abc.com/index.html?a=b#hejs you \n<a href="https://duh.com?sss,ggg">https://duh.com/?sss</a> <a href="http:www.dn.se">LINK</a></p>`));

console.log(
`<p attr=2>\nBla https://www.abc.com/index.html?a=b#hejs you \n<a href="https://duh.com?sss,ggg">https://duh.com/?sss</a> <a href="http:www.dn.se">LINK</a></p>`
.replace(/(\shref="[^"]+"\s?)/gmi,'$1 class="footnote"')

)
function splitOnXInNonWords(text) {
  const regex = /\b([^\w\s])x([^\w\s])\b/g;
  return text.matchAll(regex);
}

const input = "5x5";
const output = splitOnXInNonWords(input);
console.log(output);