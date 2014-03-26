/*jshint globalstrict: true, devel: true */
'use strict';

var fs = require('fs');

String.prototype.nbsp = function (){
	var txt = this;
	var pattern = /(\s|\n)(a|i|o|u|w|z)((\s|\n))/g; 
	var m = txt.match(pattern);

	Array.prototype.forEach.call(m, function (el) {
		txt = txt.replace(el, (el.substr(0,2)) + '&nbsp;'); //substring po to aby nie stracić litery i spacji
	});
	return txt;
};

// console.log(('ala i as poszli w las <a href').nbsp());

fs.readFile("prezydent.txt", "UTF8", function(err, txt){
	if (err){throw err};
	console.log(txt.nbsp());
});