const HTML =` Mart van Schijndel: https://www.martvanschijndel.nl/bla/bla  <a href="https://abc.def/ghi?a+b">manga</a> yo`;

function wrapLinks(inputString) {
    var R1 =
    /(\s|>)(https?:\/\/(?:www\.)?(?:[-\w@:%.\+~#=]{1,256}\.)+[a-zA-Z0-9()]{1,6}\b(?:[-\w()@:%\+.~#?&//=]*))([\s.,!?]?)/gim;
    var R2 = /(\shref="[^"]+"\s?)/gmi
    var R3 = />https?:\/\/(?:www\.)?([\w\.]+)[^<]*(?:<)/gmi

    return inputString
      .replaceAll(R1, '$1<a href="$2">$2</a>$3') // Wrap links
      .replaceAll(R2, '$1 class="footnote"') // Add footnote class
      .replaceAll(R3, ">$1<") // hide ugly urls
}

console.log(wrapLinks(HTML));