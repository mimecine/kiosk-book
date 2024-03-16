---
id: 19097719
title: Look! Sku's!
shop_id: 5892901
handle: sku
body_html: >-
  <meta charset="utf-8" />K-SKU<meta name="viewport" content="initial-scale=1,
  maximum-scale=1, user-scalable=no, minimal-ui" /><meta
  name="apple-mobile-web-app-capable" content="yes" /><meta
  name="apple-mobile-web-app-status-bar-style" content="black" />

  <style type="text/css"><!--

  .red {color: red;}

  --></style>

  <script src="ratchet/dist/js/ratchet.min.js"></script>

  <!-- Make sure all your bars are the first things in your <body> --><header
  class="bar bar-nav"><form class="input-group" id="f" name="f">

  <div class="input-row" style="border: none;">

  <h3 style="font-family: 'Montserrat', sans-serif; font-weight:
  bold;">KIOSK</h3>

  <input type="search" id="sku-search" placeholder="The Code!" style="border:
  1px inset black; width: 50%;" /></div>

  </form></header><!-- Wrap all non-bar HTML in the .content div (this is
  actually what scrolls) -->

  <div class="content" id="main-card">

  <p class="content-padded">

  <script id="product-card" type="text/x-handlebars-template">// <![CDATA[

  <div class="pull-right">
              {{#each variants}}
              <h4 class="red">{{variant this}}</h4>
              {{/each}}
        </div>
      
      
          <h4  class="content-padded pull-left">{{title}} </h4>
          <div class="content-padded pull-left">{{{description}}}</div>
          
          <div class="slider" id="images">
            <div class="slide-group">
            {{#images}}
              <div class="slide">
                <img src="{{{.}}}" style="width:100%">
              </div>
            {{/images}}
            </div>
          </div>
  // ]]></script>

  </p>

  </div>

  <script src="bower_components/handlebars/handlebars.min.js"></script>

  <script src="bower_components/jquery/dist/jquery.min.js"></script>

  <script>// <![CDATA[

  (function($){
          $(function(){
            Handlebars.registerHelper('variant', function(o){ return (o.title!='Default Title'?o.title+': ':'') + '$'+ o.price/100 + ' ' + o.sku; });       
            var product_card = Handlebars.compile($('#product-card').html());
            $('#f').on('submit',function(e){e.preventDefault(); $(document).focus()})        
            $('#sku-search').on('search',function(e){
                $(this).blur();
                if($(this).val().length > 1) $.getJSON('http://cors.io/kioskkiosk.com/search?view=json&q=sku:'+$(this).val(),function(data){
                                if(data.length){
                                  data[0].display_price = data[0].price/100;
                                }
                                $('#main-card').html(product_card(data[0]))
                })
            }).on('focus',function(){$(this)}.val(''))
          })
        })($)
  // ]]></script>
author: Marco Romeny
created_at: 2014-07-22T19:50:39-04:00
updated_at: 2014-07-22T19:50:39-04:00
published_at: 2014-06-27T15:01:00-04:00
template_suffix: nolayout
admin_graphql_api_id: gid://shopify/OnlineStorePage/19097719
metafields: []

---

K-SKU 

### KIOSK

// <!\[CDATA\[ <div class="pull-right"> {{#each variants}} <h4 class="red">{{variant this}}</h4> {{/each}} </div> <h4 class="content-padded pull-left">{{title}} </h4> <div class="content-padded pull-left">{{{description}}}</div> <div class="slider" id="images"> <div class="slide-group"> {{#images}} <div class="slide"> <img src="{{{.}}}" style="width:100%"> </div> {{/images}} </div> </div> // \]\]>

// <!\[CDATA\[ (function($){ $(function(){ Handlebars.registerHelper('variant', function(o){ return (o.title!='Default Title'?o.title+': ':'') + '$'+ o.price/100 + ' ' + o.sku; }); var product\_card = Handlebars.compile($('#product-card').html()); $('#f').on('submit',function(e){e.preventDefault(); $(document).focus()}) $('#sku-search').on('search',function(e){ $(this).blur(); if($(this).val().length > 1) $.getJSON('http://cors.io/kioskkiosk.com/search?view=json&q=sku:'+$(this).val(),function(data){ if(data.length){ data\[0\].display\_price = data\[0\].price/100; } $('#main-card').html(product\_card(data\[0\])) }) }).on('focus',function(){$(this)}.val('')) }) })($) // \]\]>