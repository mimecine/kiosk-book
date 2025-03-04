//// charms.js

// This file contains snippets of code to make PDF documents created by Prince more beautiful

// For a description of the features, see https://princexml.com/howcome/2021/guides/

// This is experimental code for demonstration purposes. 

// You may freely copy and reuse this code 

// howcome@yeslogic.com

var DEBUG=false;
var UNIT=0;  // 0=mm 1=pt 

// present number in preferred unit

function uni(val) {
  var ret;
  switch (UNIT) {
    case 0:
       ret = val/2.83464;
       return ret.toFixed(2)+"mm";
    case 1:
       return val;
  }
}


if (typeof Prince != "undefined") {
   addBoxInfoMethods();
}

function consoleLog() {
  if (DEBUG) {
     console.log.apply(null,arguments);
  }
}

function debug() {
   DEBUG=true;
   consoleLog("Debugging on");
}

//// turn on multipass

Prince.trackBoxes = true;

var funcsarr = [];
var argsarr = [];

function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  console.log(out);
}

function postlayout() {
  consoleLog("postlayout starting, there are",funcsarr.length,"functions in the queue");
  if (funcsarr.length > 0) {
    var func = funcsarr.shift();
    var arg = argsarr.shift();
    consoleLog("  postlayout:",func.name);
    func(arg);
    consoleLog("  returning from ",func.name,"re-registering postlayout");
    Prince.registerPostLayoutFunc(postlayout);
  }
}

function schedule(callback, args) {
  funcsarr.push(callback);
  argsarr.push(args);
  if (args) {
     consoleLog("  scheduling function",callback.name,"with arguments:",args);
  } else {
     consoleLog("  scheduling function",callback.name);
  }
  Prince.registerPostLayoutFunc(postlayout);
}


//// baseline alignment

// snap() provides simple baseline aligment in Prince by sizing elements 
// so that they are a multiple of the line-height. Also, the funcion can push elements downwards so that
// the distance to the top of the page box is a multiple of the line height.


// <script type="text/javascript" src="snap.js"></script>
// <body onload="snap(16, 'h2', 'margin', 'img', 'height', 'h1', 'padding')">

// the arguments to the snap function is a the snap size, and a list of selectors/method pairs
// the snap size should be equal to the line-height of the body text 
// selected elements will be adjusted to that their size is divisible by the snap size
// selected elements will be increased in size, either through increasing 'padding', 'margin' or 'height'
// the selected elements should all have "break-inside: avoid" set


function snap(lh) {
  var snapSize = topt(lh);
  var selectors = [];
  var methods = [];
	
//  consoleLog("snap",size);

  for (var i = 1; i < arguments.length; i++) {
       	if (i % 2) {  // odd number, i.e. a selector
	   selectors.push(arguments[i]);
//	   consoleLog("Registering selector",arguments[i]);
	} else { // even number 
	   if ((arguments[i]=="margin") || (arguments[i]=="margin-top") || (arguments[i]=="margin-bottom") || (arguments[i]=="padding") || (arguments[i]=="padding-top") || (arguments[i]=="padding-bottom") || (arguments[i]=="padding-even") || (arguments[i]=="height") || (arguments[i]=="growHeight") ||(arguments[i]=="shrinkHeight") || (arguments[i]=="push") || (arguments[i]=="pull") || (arguments[i]=="info")) {
              methods.push(arguments[i]);
//              consoleLog("   method:",arguments[i]);
	   } else {
//              consoleLog("   method",arguments[i],"not recognized, defaulting to padding");
              methods.push("padding");
           }
  	}
  }

  schedule(snap_postlayout,[snapSize,selectors,methods]);
}

function snap_postlayout(snap_args) {

   var snapSize = snap_args[0];
   var selectors = snap_args[1];
   var methods = snap_args[2];

   console.log("snap_postlayout",snapSize,selectors,methods);

   var dbox = document.body.getPrinceBoxes();
   var y1 = dbox[0].y;                           // using first page
   var y2 = dbox[0].y - dbox[0].h;

   consoleLog("  first page, page area height",uni(dbox[0].h));

   for(var i=0; i<selectors.length; i++) { 
      adjustSize(snapSize,selectors[i],methods[i], y1, y2);
   }
}

function adjustSize(snapSize, selector, method, y1, y2) {
   var elements = document.querySelectorAll(selector);
//   consoleLog("    adjustSize ",selector, method, y1, y2);

   for(var i=0; i<elements.length; i++) { 
      var fboxes = elements[i].getPrinceBoxes();
      consoleLog("    adjustSize -- selector: \""+selector+"\" -- snapSize:",uni(snapSize),"-- method:",method);
      switch (fboxes.length) {
	case 0:
	    consoleLog("      no fboxes",elements[i].tagName);
            break;
//	case 1:
	default:
           var paddingTop = parseFloat(fboxes[0].style.paddingTop);
           var paddingBottom = parseFloat(fboxes[0].style.paddingBottom);
           var borderTop = parseFloat(fboxes[0].style.borderTopWidth);
           var borderBottom = parseFloat(fboxes[0].style.borderBottomWidth);
//           var marginTop = parseFloat(fboxes[0].style.marginTop);
//           var marginBottom = parseFloat(fboxes[0].style.marginBottom);
           var marginTop = parseFloat(fboxes[0].marginTop);               
           var marginBottom = parseFloat(fboxes[0].marginBottom);
           var height = fboxes[0].h + marginTop + marginBottom;    // height reported includes padding/border, but not margins, therefore these are added

           var gap = snapSize - (height % snapSize);  // gap is size that must be added

           var ha = y1 - fboxes[0].y;                       // ha is height above element 
           var hb = (fboxes[0].y - fboxes[0].h) - y2;       // hb is height below element 


           consoleLog("      element",elements[i].tagName,"height with padding/border/margin: "+uni(height)+" -- pure height is "+uni(height-marginTop-marginBottom-paddingTop-paddingBottom-borderTop-borderBottom), "-- maT:", marginTop,"-- maB", marginBottom);
//           consoleLog("      element",elements[i].tagName,"must be increased in height with",gap,"pt");
          consoleLog("      element",elements[i].tagName,"must be increased in height with",uni(gap),"-- snapsize is "+uni(snapSize));
           consoleLog("      current values: height",uni(height),"paB",uni(paddingBottom),"paT",uni(paddingTop),"boB",uni(borderBottom),"boT",uni(borderTop),"maB",uni(marginBottom),"maT",uni(marginTop));

	   var has = ha / (ha + hb);   // fraction above element
	   var hbs = hb / (ha + hb);   // fraction below element

	   if ((method=="height") || (method=="growHeight")) {
               var newheight = height + gap - (paddingTop + paddingBottom + borderTop + borderBottom + marginTop + marginBottom);
               elements[i].style.height = newheight+"pt";
               consoleLog("      growing height -- gap",uni(gap),"new styleheight:",uni(newheight),"-- styleheight + padding + border =", uni(newheight+paddingBottom+paddingTop+borderBottom+borderTop));
	   } else if (method=="shrinkHeight") {
               newheight = height + gap - (paddingTop + paddingBottom + borderTop + borderBottom) - snapSize;
               elements[i].style.height = newheight+"pt";
               consoleLog("      shrinking height -- gap",gap,"new style height:",newheight,"-- style height + padding + border =", (newheight+paddingBottom+paddingTop+borderBottom+borderTop));
	   } else if (method=="padding") {
               consoleLog("      about to set padding, values before: paddingTop",uni(paddingTop),"paddingBottom:",uni(paddingBottom));
               paddingTop += has * gap;
               paddingBottom += hbs * gap;
               elements[i].style.paddingTop = paddingTop+"pt";
               elements[i].style.paddingBottom = paddingBottom+"pt";
               consoleLog("      setting padding: paddingTop",uni(paddingTop),"paddingBottom:",uni(paddingBottom));
           } else if (method=="margin") {
               marginTop += has * gap;
               marginBottom += hbs * gap;
               elements[i].style.marginTop = marginTop+"pt";
               elements[i].style.marginBottom = marginBottom+"pt";
	   } else if (method=="margin-top") {
               marginTop = gap;
               elements[i].style.marginTop = marginTop+"pt";
           } else if (method=="margin-bottom") {
               marginBottom = gap;
               elements[i].style.marginBottom = marginBottom+"pt";
           } else if (method=="padding-top") {
               paddingTop += gap;
               elements[i].style.paddingTop = paddingTop+"pt";
           } else if (method=="padding-bottom") {
               if (paddingBottom > snapSize) {
                   paddingBottom += (gap - snapSize);
               }
               else {
                   paddingBottom += gap;
               }
               elements[i].style.paddingBottom = paddingBottom+"pt";
//               console.log("  setting paddingBottom",paddingBottom+"pt");
           } else if (method=="padding-even") {
               paddingTop += gap/2;
               paddingBottom += gap/2;
               elements[i].style.paddingTop = paddingTop+"pt";
               elements[i].style.paddingBottom = paddingBottom+"pt";

c           } else if (method=="push") {                    // todo: check if padding/border is non-zero
	       paddingTop += snapSize - (ha % snapSize);
               elements[i].style.paddingTop = paddingTop+"pt";
           } else if (method=="pull") {
               consoleLog(" ha",ha,"paddingTop",paddingTop, "ha+paddingTop",(ha+paddingTop),"ha%snapSize",(ha%snapSize));
               consoleLog(" about to add",(ha%snapSize),"to bottom padding");
               paddingBottom += (ha % snapSize);
               elements[i].style.paddingBottom = paddingBottom+"pt";

           } else if (method=="balance") {
               var newheight = height + gap - (paddingTop + paddingBottom + borderTop + borderBottom + marginTop + marginBottom);
               elements[i].style.height = newheight+"pt";
               consoleLog("      balancing height -- gap",uni(gap),"new styleheight:",uni(newheight),"-- styleheight + padding + border =", uni(newheight+paddingBottom+paddingTop+borderBottom+borderTop));

           } else if (method=="info") {
               consoleLog("INFO ha",ha,"paddingTop",paddingTop, "ha+paddingTop",(ha+paddingTop),"ha%snapSize",(ha%snapSize));
           }
           break;
//        default: 
//           consoleLog("FRAGMENTATION ALERT! Element spans several pages ");
      }
   }
}


// achieve baseline alignment by adjusting height of element to a multiple of line-heigt + addition
//
// <body onload="height('img', '5mm', '3mm')">
// function height(sel, snap, add, method) {


// height('p', '5mm', '3mm', '+-')

function height(sel, snap, add, method) {
  schedule(height_postlayout, [sel, snap, add, method]);
}

function height_postlayout(height_args) {
   var sel = height_args[0];
   var snap = topt(height_args[1]);
   var add = topt(height_args[2]);
   var method = height_args[3]; 

   var elements = document.querySelectorAll(sel);
   for(var i=0; i<elements.length; i++) { 
      var boxes = elements[i].getPrinceBoxes();
      switch (boxes.length) {
	case 0:
	default:   // there's one box

           var paddingTop = parseFloat(boxes[0].style.paddingTop);
           var paddingBottom = parseFloat(boxes[0].style.paddingBottom);
           var borderTop = parseFloat(boxes[0].style.borderTopWidth);
           var borderBottom = parseFloat(boxes[0].style.borderBottomWidth);
           var marginTop = parseFloat(boxes[0].marginTop);               
           var marginBottom = parseFloat(boxes[0].marginBottom);
           var height = boxes[0].h;    // .h includes padding/border, but not margins
           height = height - paddingBottom - paddingTop;
	   var diff = (height - add) % snap; 
	   if (DEBUG) {
              consoleLog("--- height, as reported",uni(height),"add",uni(add),"snap",uni(snap),"diff",uni(diff));
           }

           var newheight;
           if (diff > (snap/2)) {
              newheight = height + (snap - diff);
           } else {
              newheight = height - diff;
           }

           if (DEBUG) {
             consoleLog("--- height, as reported",uni(height),"paB",uni(paddingBottom),"paT",uni(paddingTop),"boB",uni(borderBottom),"boT",uni(borderTop),"maB",uni(marginBottom),"maT",uni(marginTop));
	     consoleLog("---> newheight ",uni(newheight), uni(diff), uni(snap));
           }
           elements[i].style.height = newheight+"pt";
      }
   }
}


// '15pt' -> 15, '20px' -> 15. 

function topt(str) {
  var resarr;
  var result = 0;  

  if (resarr = /(\d+)pt/.exec(str)) {
     result = resarr[1];
  } else if (resarr = /(\d+)px/.exec(str)) {
     result = resarr[1] * 0.75;
  } else if (resarr = /(\d+)mm/.exec(str)) {
     result = resarr[1] * 2.83464;
  } else if (resarr = /(\d+)cm/.exec(str)) {
     result = resarr[1] * 28.3464;
  } else if (resarr = /(\d+)in/.exec(str)) {
     result = resarr[1] * 72;
  } else if (resarr = /(\d+)/.exec(str)) {
     result = resarr[1];
  } else {
     console.log("usage: topt(length) -- pt, px, mm, in units understood")
  }
  consoleLog("    topt",str,"==",result,"points");
  return result;
}




//// pageArea() is a purely diagnostic/analytica function which prints the height of 
//// the page area and suggest modifications so that the page area will be a tight container for 
//// the prevailing line-height (which is an argument to the function)

// e.g. pageArea('11pt');

// 1 in = 2.54 cm = 25.4 mm = 72 pt = 96 px = 6 pc
// pt * 4 / 3 = px
// pt / 28.346 = mm

// 1pt = 0.352mm
// 1mm = 2.84pt
// 11pt = 3.872mm
// 11.35pt = 3.995mm = 15.133px
// 5mm = 14.2pt
//   231pt = 81.3mm

function pageArea(size) {
  schedule(pageArea_postlayout, size)
}

function pageArea_postlayout(lh) {  
   var pages = PDF.pages;
   var delta; 
   var lhpt = topt(lh);

   for (var i = 0; i<pages.length; ++i) {
      delta = pages[i].h % lhpt;
      console.log("    page",i+1,"height is",pages[i].h,"pt","which is",pages[i].h*0.352,"mm");
      console.log("      height must be reduced",delta,"pt to be a tight frame for",lhpt,"pt line-height");
      console.log("     ",lhpt,"pt =",lhpt*4/3,"px =",lhpt * (25.4/72),"mm");
      console.log("     ",delta,"pt =",delta*4/3,"px =",delta * (25.4/72),"mm");
   }
}


//// info() prints our information about the boxes of elements

function info(selector) {
  schedule(info_postlayout,selector)
}

function info_postlayout(selector) {
   var elements = document.querySelectorAll(selector);

   console.log("Found ",elements.length,"elements from selector",selector);
   for(var i=0; i<elements.length; i++) { 
      var fboxes = elements[i].getPrinceBoxes();
      console.log("    element",(i+1),"has",fboxes.length,"boxes");
//      printObject(fboxes[0].style);
      for (var j=0; j<fboxes.length; j++) {
          printObject(fboxes[j]);
//          printObject(fboxes[j].parent);
      }
   }
}

//// textfit() will change the font size of text on a line 

// textfit takes between one a three arguments:
//   selector 
//   size: represents the percentage of the line width that should be filled, 100 being default
//   even: a boolean
 

function textfit() {
//  consoleLog("textfit",selector);
  var selector;
  var size = 100;
  var even = false;

  switch (arguments.length) {
      case 1:
        selector = arguments[0];
        break;
      case 2:
        selector = arguments[0];
        size = parseFloat(arguments[1]);
        break;
      case 3:
        selector = arguments[0];
        size = parseFloat(arguments[1]);
//        consoleLog("odd or even?");
        if (arguments[2]) {
           var even = true;
           consoleLog("even!!");
        }
        break;
      default:
        consoleLog("textfit: wrong number of arguments")
  }

  var elems = document.querySelectorAll(selector);
  for (var i = 0; i < elems.length; i++) {
     addSpan(elems[i]);                        // add span elements around all words in all elements
  }
  schedule(textfit_postlayout,[selector, size, even])
}


function textfit_postlayout(textfit_args) {
    var selector = textfit_args[0];
    var size = textfit_args[1];
    var even = textfit_args[2];

//    consoleLog("Textfit_postlayout",selector, size, even);
    var elems = document.querySelectorAll(selector);
//    consoleLog("number of elements",elems.length);
    for (var i = 0; i < elems.length; i++) {                           // go through all elems that match selector
        var elem = elems[i]; 
        var elemboxes = elem.getPrinceBoxes();
        var elembox = elemboxes[0];

        var minfs = 0;

        spans = elem.querySelectorAll("span.textfit");
//        consoleLog("number of span.textfit",spans.length);
        for (var j = 0; j < spans.length; j++) {                       // go through all elems that were created by script
             var boxes = spans[j].getPrinceBoxes();
             var box = boxes[0];
             var fs = parseFloat(box.style.fontSize); // current font size of span
             var line = findLine(box);

             var linelength = line.parent.w;
             linelength = elembox.contentBox("pt").w;
//             console.log("linelength",linelength,"line.parent.w", line.parent.w);

             fullw = linelength * (size/100);
             fs = fs / (line.w/fullw);
             if ((fs < minfs) || (minfs == 0)) { 
                 minfs = fs;
             }
             box.element.style.fontSize = fs + "pt";        // set on span element
             elem.style.fontSize = fs + "pt";               // also set on parent element, so that the em unit works
        }
	if (even) {
            for (var j = 0; j < spans.length; j++) {                       // go through all elems that were created by script
                var boxes = spans[j].getPrinceBoxes();
                var box = boxes[0];
                box.element.style.fontSize = minfs + "pt";        // set on span element
                elem.style.fontSize = minfs + "pt";               // also set on parent element, so that the em unit works
            }
        }
    }
}

function findLine(box) {
   if (box.type == "LINE") {
      return box;
   } else {
      return findLine(box.parent);
   }
}

function addSpan(elem) {
    var node = elem.firstChild;
    while (node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            addSpan(node);
            node = node.nextSibling;
        } else if (node.nodeType === Node.TEXT_NODE) {
//            var words = node.data.split(/(\s+)/);
            var words = node.data.split(/( +)/);
            for (var i = 0; i < words.length; ++i) {
                var newNode;
                if (words[i].trim() === "") {
                    newNode = document.createTextNode(words[i]);
                } else {
                    newNode = document.createElement("span");
                    newNode.textContent = words[i] + " ";      // space must be inside span 
	            newNode.className = "textfit";
//                    consoleLog("adding span",
                }
                node.parentNode.insertBefore(newNode, node);
            }
            var nextNode = node.nextSibling;
            node.parentNode.removeChild(node);
            node = nextNode;
        } else {
            node = node.nextSibling;
        }
    }
}



function findbody(box) {
//  consoleLog(box.type);
  if (box.type == 'BODY') {
    return box;
  }
  return findbody(box.parent);
}


//// alignCaption

// proof of concept to show how to align caption element with a top-floating parent <figure> element

function alignCaptions() {
  var args = [];
  for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
      consoleLog(" registering argument",arguments[i]);
  }
  schedule(aligncaption_postlayout, args);
}

function aligncaption_postlayout(args)
{
   var selector;
   switch (args.length) {
      case 1:
        selector = args[0];
        consoleLog("ac_postlayout: ",selector);
        break;
      case 2:
        selector = args[0];
        tocselector = args[1];
        exit;
        break;
      default:
        consoleLog("ac: wrong number of arguments")
        exit;
   }

   var elems = document.querySelectorAll(selector);
   for (var i = 0; i < elems.length; i++) {
      var child = elems[i];
      var parent = elems[i].parentNode;
      var childboxes = elems[i].getPrinceBoxes(); 
      if (childboxes.length > 0) {

//  we now know the height of the child box; next step is to find the height of the parent box and work out the difference

         var parentboxes = parent.getPrinceBoxes(); 
         if (parentboxes.length > 0) {
               var diff = parentboxes[0].h - childboxes[0].h; 
//               console.log("parent height is "+parentboxes[0].h+" vs child height "+childboxes[0].h+" diff is ",diff);
               child.style.marginTop = diff+"pt";
//               console.log("      setting margintop to ",diff);
         }
      }
   }
}



//// add marker / call elements on sidenotes

function addSidenoteMarks(selector, classname) {
   var elems = document.querySelectorAll(selector);
   consoleLog("addSidenoteMarks selecting "+selector+" -- adding class: "+classname);
   for (var i = 0; i < elems.length; i++) {
      var call = document.createElement("span");
      call.classList.add(classname);
      consoleLog("addSidenoteMarks creaing "+call);
      elems[i].parentNode.insertBefore(call, elems[i]);
   }
}


//// toc

function toc() {
  var toc_args = [];
  for (var i = 0; i < arguments.length; i++) {
      toc_args.push(arguments[i]);
      consoleLog("  toc registering argument",arguments[i]);
  }
  schedule(toc_postlayout, toc_args);
}

function toc_postlayout(toc_args)
{
   var tocselector = "#toc";
   switch (toc_args.length) {
      case 1:
        selector = toc_args[0];
        consoleLog("toc_postlayout: ",selector);
        break;
      case 2:
        selector = toc_args[0];
        tocselector = toc_args[1];
        break;
      default:
        consoleLog("toc: wrong number of arguments")
   }

//   consoleLog("POSTLAYOUT These elements will appear in toc:",selector);
//   consoleLog("POSTLAYOUT ToC will appear inside this element:",tocselector);

   var elems = document.querySelectorAll(selector);
   var ToCelems = document.querySelectorAll(tocselector);

   if (ToCelems.length > 0) {
      var ToCelem = ToCelems[0];
   } else {
      consoleLog("No ToC element found");
      return;
   }

   for (var i = 0; i < elems.length; i++) {
//      var before = pseudotext(elems[i]);
      var str = addpseudotext(elems[i], " "," "); 
      var text = document.createTextNode(str);
//      consoleLog("TEXT: ", str);
//      var text = document.createTextNode(getText(elems[i]));
//      var text = document.createTextNode(window.getComputedStyle(elems[i], ':before').content);
      elems[i].setAttribute("id", "ch"+i);
      var link = document.createElement("a");
      link.setAttribute("href", "#ch"+i);
      link.appendChild(text);
//      link.appendChild(bt);
      var li = document.createElement("li");
      li.className += elems[i].localName;
      li.appendChild(link);
      ToCelem.appendChild(li); 
   }
}


function addpseudotext(el,bstr,astr) {
      var boxes = el.getPrinceBoxes();    // get the boxes associated with the paragraph, there can be more than one if the paragaph spans several pages
      var str = ""

      if (el.textContent) {
         str = el.textContent;
      }

      for (var j=0; j<boxes.length; j++) {   // go through list of boxes
          box = boxes[j];
          switch (box.pseudo) {
             case "before":
//                printObject(box.element);
//	        consoleLog("  pseudotext returning: ",box.children[0].text);
                str = box.children[0].text + bstr + str;
                break;
             case "after":
                str = str + astr + box.children[0].text;
                break;
          }
      }
//     consoleLog("  pseudotext returning: ",astr+el.textContent+bstr);
     return(str);
}

//// indexes

function index() {
  schedule(index_postlayout);
}

function index_postlayout() {
    var ida = new Array();
    var enta = new Array();
    var str="";

// find all elements that contain index entries, these are marked with "class=ix" or "class=ixb" (for bold)

    var ix = document.querySelectorAll('.ix, .ixb');  // get all elements that are tagged for inclusion in the index

// go through these elements, give them a unique id attribute so they can be linked to

    for(var i=0; i<ix.length; i++) {

        ix[i].setAttribute("id", "ix"+i);      // set id attribute on elements tagged for inclusion

// if title attribute is specified, use it in the index. Else use the textual content

	var ent = ix[i].getAttribute("title");
        if (! ent) {
            ent = ix[i].textContent;
        }

// add index entry to an array for later sorting

	if ((enta.join("")).indexOf(ent) < 0) { 
            enta.push(ent);
        }

// create an array to hold references to this entry (e.g. "Bach")

        if (! ida[ent]) {
           ida[ent] = new Array();
        }

// add reference to the array

        ida[ent].push(i);                     // what is added to the array is a reference so that we can find the element later
//        consoleLog(" adding ref",ent,i);
    }

// sort the index entries alphabetically, case-insensitively 

    enta.sort(
        function(a, b) {
           if (a.toLowerCase() < b.toLowerCase()) return -1;
           if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;});


    var el;

// loop through entries and weed out references so that there is only one reference per entry per page. bold entries win over normal ones

    var prevmain = undefined;
    var main = undefined;
    var sub = undefined;

    for (var i=0; i<enta.length; i++) {

       var prevpage = undefined; 
       var normal = undefined;
       var bold = undefined;

       ent = enta[i];
       var a = ida[ent];  // array which now contains a list of indexes that belong to an entry

//       consoleLog("Index entry",ent,a.length);

       for (var j = a.length-1; j >= 0; j--) {       // reverse order is important as we will cull the array along the way
          el = ix[a[j]];
          var page = getPage(el);
          el.page = page;                                    // record the page number of the element which caused the reference
//          consoleLog("  ref",j,el.id,el.className);

          if (page == prevpage) {    // if we are still on the same page, something has to be deleted
             if (bold) {             // if bold ref has been set for this page already, we should remove current ref
                 a.splice(j,1);      // remove ref
//                 consoleLog("  removing in bold ",j);
                 continue;
             }

             if (el.className == 'ixb') {   // is this a bold page reference?
                 if (normal) {              // if normal ref has been set for this page, remove it
                     a.splice(normal,1)
//                     consoleLog("  removing in normal",j);
                 }
                 bold = j;                  // remember the bold reference
                 continue;
             }

             if (normal) {            // if this is a normal reference, remove the previous normal reference
                  a.splice(normal,1)
//                  consoleLog("  REMOVING IN NORMAL",j);
                  normal = j;
             }
          } else {
             prevpage = page;
             if (el.className == 'ixb') { 
                bold = j;
//                consoleLog("  recording bold",j);
             } else {
                normal = j;
//                consoleLog("  recording normal",j);
             }
          }
       }

// we have now culled double entries, we now will go through the remaining entries and create the index. 
// the hard part in this section is to combine page numbers e.g. "1, 2, 3, 5" should become "1-3, 5"

//       re = /([^;]*);([^;]*)/;

       if (ent.search(/;/) > -1) {    // is there a semi-colon in entry?
           var found = ent.match(/(.*)\s*;\s*(.*)/)
           var main = found[1];
           var sub = found[2];

           if (main == prevmain) {
               str = str + "\n<li class=subentry>" + sub + "&nbsp;";
           } else {
               prevmain = main;
               str = str + "\n<li class=entry>" + main + "\n<li class=subentry>" + sub + "&nbsp;";
           }
       } else {
           str = str + "\n<li class=entry>" + ent + "&nbsp;";
           prevmain = ent;
       }

       var el=undefined;       // this reference
       var pel=undefined;      // the previous reference
       var series=undefined;   // are we in a series that should be combined?

       for (var j=0; j < a.length; j++) {  

          el = ix[a[j]];   // find element pointed to by ref
	  el.page -=1;
          
          if (el.className) {                            // make string from element's classname
              var classname=" class="+el.className;
          } else {
              classname="";
          }

          if (! pel) {  // pel is undefined, so this is the first entry. 
             str = str + "<a href=#ix"+a[j]+classname+">xx</a>"; 
             pel=el;
             continue;
          }

          if (pel.className) {                            // make string from previous element's classname
              var pclassname=" class="+pel.className;
          } else {
              pclassname="";
          }

          if (el.page == pel.page + 1 ) {                 // if we are close
              if (el.className == pel.className) {
                 series = "-";                            // we are in a series which should be combined
                 pel = el;
                 continue;
              } else {                                    // different classname, we must terminate previous element (pel)
                 if (series) {
                     str = str + "&ndash;<a href=#ix"+a[j-1]+pclassname+">"+pel.page+"</a>";
                     series = undefined;                  // series has been terminated
                 }
                 str = str + ", <a href=#ix"+a[j]+classname+">"+el.page+"</a>";
                 pel=el;
              }
          } else {                                        // we are not close, so we must terminate previous element (pel)
             if (series) {
                 str = str + "&ndash;<a href=#ix"+a[j-1]+pclassname+">"+pel.page+"</a>";
                 series = undefined;                      // series has been terminated
             }
             str = str + ", <a href=#ix"+a[j]+classname+">"+el.page+"</a>";
             pel=el;
          } 
       }

       if (series) {
          str = str + "&ndash;<a href=#ix"+a[j-1]+classname+">"+el.page+"</a>";
       }
    }
//    consoleLog(str);
    document.getElementById("index").innerHTML = str;
}



function indexChapters(sel) {

    var ex = document.querySelectorAll(sel); 
    for(var e=0; e<ex.length; e++) {
      consoleLog

    }

    var ida = new Array();
    var enta = new Array();
    var str="";

// find all elements that contain index entries, these are marked with "class=ix" or "class=ixb" (for bold)

    var ix = document.querySelectorAll('.ix, .ixb');  // get all elements that are tagged for inclusion in the index

// go through these elements, give them a unique id attribute so they can be linked to

    for(var i=0; i<ix.length; i++) {

        ix[i].setAttribute("id", "ix"+i);      // set id attribute on elements tagged for inclusion

// if title attribute is specified, use it in the index. Else use the textual content

	var ent = ix[i].getAttribute("title");
        if (! ent) {
            ent = ix[i].textContent;
        }

// add index entry to an array for later sorting

	if ((enta.join("")).indexOf(ent) < 0) { 
            enta.push(ent);
        }

// create an array to hold references to this entry (e.g. "Bach")

        if (! ida[ent]) {
           ida[ent] = new Array();
        }

// add reference to the array

        ida[ent].push(i);                     // what is added to the array is a reference so that we can find the element later
//        consoleLog(" adding ref",ent,i);
    }

// sort the index entries alphabetically, case-insensitively 

    enta.sort(
        function(a, b) {
           if (a.toLowerCase() < b.toLowerCase()) return -1;
           if (a.toLowerCase() > b.toLowerCase()) return 1;
        return 0;});


    var el;

// loop through entries and weed out references so that there is only one reference per entry per page. bold entries win over normal ones

    var prevmain = undefined;
    var main = undefined;
    var sub = undefined;

    for (var i=0; i<enta.length; i++) {

       var prevpage = undefined; 
       var normal = undefined;
       var bold = undefined;

       ent = enta[i];
       var a = ida[ent];  // array which now contains a list of indexes that belong to an entry

//       consoleLog("Index entry",ent,a.length);

       for (var j = a.length-1; j >= 0; j--) {       // reverse order is important as we will cull the array along the way
          el = ix[a[j]];
          var page = getPage(el);
          el.page = page;                                    // record the page number of the element which caused the reference
//          consoleLog("  ref",j,el.id,el.className);

          if (page == prevpage) {    // if we are still on the same page, something has to be deleted
             if (bold) {             // if bold ref has been set for this page already, we should remove current ref
                 a.splice(j,1);      // remove ref
//                 consoleLog("  removing in bold ",j);
                 continue;
             }

             if (el.className == 'ixb') {   // is this a bold page reference?
                 if (normal) {              // if normal ref has been set for this page, remove it
                     a.splice(normal,1)
//                     consoleLog("  removing in normal",j);
                 }
                 bold = j;                  // remember the bold reference
                 continue;
             }

             if (normal) {            // if this is a normal reference, remove the previous normal reference
                  a.splice(normal,1)
//                  consoleLog("  REMOVING IN NORMAL",j);
                  normal = j;
             }
          } else {
             prevpage = page;
             if (el.className == 'ixb') { 
                bold = j;
//                consoleLog("  recording bold",j);
             } else {
                normal = j;
//                consoleLog("  recording normal",j);
             }
          }
       }

// we have now culled double entries, we now will go through the remaining entries and create the index. 
// the hard part in this section is to combine page numbers e.g. "1, 2, 3, 5" should become "1-3, 5"

//       re = /([^;]*);([^;]*)/;

       if (ent.search(/;/) > -1) {    // is there a semi-colon in entry?
           var found = ent.match(/(.*)\s*;\s*(.*)/)
           var main = found[1];
           var sub = found[2];

           if (main == prevmain) {
               str = str + "\n<li class=subentry>" + sub + "&nbsp;";
           } else {
               prevmain = main;
               str = str + "\n<li class=entry>" + main + "\n<li class=subentry>" + sub + "&nbsp;";
           }
       } else {
           str = str + "\n<li class=entry>" + ent + "&nbsp;";
           prevmain = ent;
       }

       var el=undefined;       // this reference
       var pel=undefined;      // the previous reference
       var series=undefined;   // are we in a series that should be combined?

       for (var j=0; j < a.length; j++) {  

          el = ix[a[j]];   // find element pointed to by ref
	  el.page -=1;
          
          if (el.className) {                            // make string from element's classname
              var classname=" class="+el.className;
          } else {
              classname="";
          }

          if (! pel) {  // pel is undefined, so this is the first entry. 
             str = str + "<a href=#ix"+a[j]+classname+">xx</a>"; 
             pel=el;
             continue;
          }

          if (pel.className) {                            // make string from previous element's classname
              var pclassname=" class="+pel.className;
          } else {
              pclassname="";
          }

          if (el.page == pel.page + 1 ) {                 // if we are close
              if (el.className == pel.className) {
                 series = "-";                            // we are in a series which should be combined
                 pel = el;
                 continue;
              } else {                                    // different classname, we must terminate previous element (pel)
                 if (series) {
                     str = str + "&ndash;<a href=#ix"+a[j-1]+pclassname+">"+pel.page+"</a>";
                     series = undefined;                  // series has been terminated
                 }
                 str = str + ", <a href=#ix"+a[j]+classname+">"+el.page+"</a>";
                 pel=el;
              }
          } else {                                        // we are not close, so we must terminate previous element (pel)
             if (series) {
                 str = str + "&ndash;<a href=#ix"+a[j-1]+pclassname+">"+pel.page+"</a>";
                 series = undefined;                      // series has been terminated
             }
             str = str + ", <a href=#ix"+a[j]+classname+">"+el.page+"</a>";
             pel=el;
          } 
       }

       if (series) {
          str = str + "&ndash;<a href=#ix"+a[j-1]+classname+">"+el.page+"</a>";
       }
    }
//    consoleLog(str);
    document.getElementById("index").innerHTML = str;
}





function getPage(el) {

    var elboxes = el.getPrinceBoxes(); 
    if (elboxes.length > 0) {
        return elboxes[0].pageNum;         // page number where ref appears
    } else {
        consoleLog("GetPage, can't find page");
        return udefined;
    }
}

//// simpletoc

function simpleToc() {

   var selector;
   var tocselector = "#toc";

   switch (arguments.length) {
      case 1:
        selector = arguments[0];
        break;
      case 2:
        selector = arguments[0];
        tocselector = arguments[1];
        break;
      default:
        consoleLog("toc: wrong number of arguments")
   }

//   consoleLog("SIMPLETOC These elements will appear in toc:",selector);
//   consoleLog("SIMPLETOC ToC will appear inside this element:",tocselector);

   var elems = document.querySelectorAll(selector);
   var ToCelems = document.querySelectorAll(tocselector);

   if (ToCelems.length > 0) {
      var ToCelem = ToCelems[0];
   } else {
      consoleLog("No ToC element found");
      exit;
   }

   for (var i = 0; i < elems.length; i++) {

      var str = elems[i].textContent;
      var text = document.createTextNode(str);
//      consoleLog("TEXT: ", str);

//      var text = document.createTextNode(getText(elems[i]));
//      var text = document.createTextNode(window.getComputedStyle(elems[i], ':before').content);

      elems[i].setAttribute("id", "ch"+i);
      var link = document.createElement("a");
      link.setAttribute("href", "#ch"+i);
      link.appendChild(text);
//      link.appendChild(bt);
      var li = document.createElement("li");
      li.className += elems[i].localName;
      li.appendChild(link);
      ToCelem.appendChild(li); 
   }
}


function boxInfo(selector) {
   console.log("boxInfo",selector);
   schedule(boxInfo_postlayout,selector);
}

function boxInfo_postlayout(selector) {

   var e = document.querySelectorAll(selector);
//   console.log("number of elements",e.length, selector);
   var b = e[0].getPrinceBoxes();
//   printObject(b[0]);
//   console.log("Content width is " + b[0].contentBox("cm").w + "cm");
   return b[0];
}


// pageInfo

function pageInfo(querypage) {
//   console.log("pageInfo",querypage);
   schedule(pageInfo_postlayout,querypage);
}

function pageInfo_postlayout(querypage) {
   var pages = PDF.pages;

   console.log("<html><style>body { width: 600pt; height: 900pt; background: white;  } \n div { position: absolute; border: thin solid black }\n.line, .span, .text { display: none } </style>\n<body>");

   console.log("<pre>\n");
   printObject(PDF.pages[10]);
   console.log("</pre>\n");

   if (querypage) {
      if (querypage <= pages.length) {
         printBoxes("  ",pages[querypage-1]);
      }
   } else {
      for(var i=0; i<pages.length; i++) {
         printBoxes("  ",pages[i]);
      }
   }
}

function printBoxes(str,box) 
{
    console.log("");
    for (var i in box)
    {
//        console.log(str+i+": "+box[i]);
    }

    var y=800-box.y;  // we should be able to find that number through the box api
 
    console.log("<div class="+box.type+" style='width: "+box.w+"pt; height: "+box.h+"pt; left: "+box.x+"pt; top: "+y+"pt'>");
    console.log(box.type);
    console.log("</div>");

    for (var i=0; i<box.children.length; i++) {
//       console.log("    "+i+": "+box.children[i]);
       printBoxes(str+"  ",box.children[i]);
    }
}


function isTopFloat(b) {
    if (b.parent && b.parent.type === "FLOATS") {
        return b.parent.y == b.parent.parent.y
    } else {
        return false;
    }
}

// cheat sheet: 1mm = 2.83 points -- 0.3553mm = 1pt  


function printDiv(box,color) {
   var y = 751.18110236220481000 - box.y; 
   console.log("<div style='width: "+box.w+"pt; height: "+box.h+"pt; left: "+box.x+"pt; top: "+y+"pt; background: "+color+"'></div><!--",box.y,"-->");
}

// is there footnotes area on this page?
// if so, record its size, establish the bounds
// look for notes on the page (based on a selector) -- two selectors: fixed notes, and flexible notes
// loop through all notes -- do they collide?
// if so, go through from top to bottom. Push movaledownwards. 
// if still conflict, move upwards


function findFootnoteBox(box) {
//  console.log ("findfnbox",box.type);
  if (box.type == "FOOTNOTES") {
     return(box);
  }

  for (var i=0; i<box.children.length; i++) {
     var ret = findFootnoteBox(box.children[i]);
     if (ret) {
          return(ret);
     }
  }
  return null;
}



// This file adds some useful higher-level functionality to the Box Tracking
// API (https://www.princexml.com/doc/javascript/#the-box-tracking-api).
//
// To use the features it just needs to be included in the HTML, e.g.:
//
// <script src="box-sizes.js"></script>
//
// The following methods will then be available on BoxInfo objects returned
// by getPrinceBoxes().
//
// Methods:
//      marginBox(u)
//      borderBox(u)
//      paddingBox(u)
//      contentBox(u)
//
// Parameters:
//      u   The units to use. One of "cm", "in", "mm", "q", "pc", "pt" or "px".
//
// Return value:
//      A box object with properties x, y, w and h giving the position and
//      size of the box in the requested units.
//
// Example:
//      var e = document.getElementById("someId");
//      var b = e.getPrinceBoxes()[0];
//      console.log("Content width is " + b.contentBox("cm").w + "cm");


function Box(x, y, w, h, u) {
    var d = 1;

    if (u == "cm") {
        d = 72/2.54;
    } else if (u == "in") {
        d = 72;
    } else if (u == "mm") {
        d = 72/25.4;
    } else if (u == "q") {
        d = 72/101.6;
    } else if (u == "pc") {
        d = 1/12;
    } else if (u == "pt") {
        d = 1;
    } else if (u == "px") {
        d = 72/96;
    } else {
        console.log("Box: unknown units: " + u);
    }

    this.x = x/d;
    this.y = y/d;
    this.w = w/d;
    this.h = h/d;
}

function addBoxInfoMethods() {
    BoxInfo.prototype.marginBox = function (u) {
        var x = this.x - this.marginLeft;
        var y = this.y + this.marginTop;
        var w = this.w + this.marginLeft + this.marginRight;
        var h = this.h + this.marginTop + this.marginBottom;
        return new Box(x, y, w, h, u);
    };

    BoxInfo.prototype.borderBox = function (u) {
        var x = this.x;
        var y = this.y;
        var w = this.w;
        var h = this.h;
        return new Box(x, y, w, h, u);
    };

    BoxInfo.prototype.paddingBox = function(u) {
        var bTop = parseFloat(this.style.borderTopWidth.slice(0, -2));
        var bRight = parseFloat(this.style.borderRightWidth.slice(0, -2));
        var bBottom = parseFloat(this.style.borderBottomWidth.slice(0, -2));
        var bLeft = parseFloat(this.style.borderLeftWidth.slice(0, -2));
        var x = this.x + bLeft;
        var y = this.y - bTop;
        var w = this.w - bLeft - bRight;
        var h = this.h - bTop - bBottom;
        return new Box(x, y, w, h, u);
    };

    BoxInfo.prototype.contentBox = function(u) {
        var bTop = parseFloat(this.style.borderTopWidth.slice(0, -2));
        var bRight = parseFloat(this.style.borderRightWidth.slice(0, -2));
        var bBottom = parseFloat(this.style.borderBottomWidth.slice(0, -2));
        var bLeft = parseFloat(this.style.borderLeftWidth.slice(0, -2));
        var pTop = parseFloat(this.style.paddingTop.slice(0, -2));
        var pRight = parseFloat(this.style.paddingRight.slice(0, -2));
        var pBottom = parseFloat(this.style.paddingBottom.slice(0, -2));
        var pLeft = parseFloat(this.style.paddingLeft.slice(0, -2));
        var x = this.x + bLeft + pLeft;
        var y = this.y - bTop - pTop;
        var w = this.w - bLeft - bRight - pLeft - pRight;
        var h = this.h - bTop - bBottom - pTop - pBottom;
        return new Box(x, y, w, h, u);
    };
}

/* 

addToggle adds one <label> and one <input> element before all elements matched by selector
The <label> and <input> elements are typically used to hide/display the selected elements on mobile phones

*/


function addToggle(selector,str,mark) {
   var elements = document.querySelectorAll(selector);
   for(var i=0; i<elements.length; i++) {

      var label = document.createElement("label");
      label.classList.add("toggle");
      label.classList.add(str);
      label.setAttribute("for",str+i);
      label.innerHTML = mark;
      elements[i].parentNode.insertBefore(label, elements[i]);

      var input = document.createElement("input");
      input.setAttribute("type","checkbox");
      input.setAttribute("id",str+i);
      input.classList.add("toggle");
      elements[i].parentNode.insertBefore(input, elements[i]);
   }
}


function snapIntermissions() {
    var intermissions = document.querySelectorAll('.intermission_content');
    console.log('intermissions', intermissions);

    for(var i = 0; i < intermissions.length; i++) {
        console.log('intermission', intermissions[i]);
        var intermission = intermissions[i];
        var intermissionRect = intermission.getBoundingClientRect();
        console.log('intermissionRect', intermissionRect);
        console.log(intermission.style.height,intermissionRect.height+(16-intermissionRect.height%16) + 'px');
        intermission.style.height = intermissionRect.height+(16-intermissionRect.height%16) + 'px';
    }
}