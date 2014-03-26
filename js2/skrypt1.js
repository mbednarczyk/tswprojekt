$(function () { 
	 var glebokosc = function (root) {
        var children = $(root).children(); //root jest zazwyczaj <html>
        var gleb = 0;
        console.log(children);
        while (children.length > 0) {  //do poki element ma dzieci
            // console.log(children.length);
            children = children.contents(); 
            gleb = gleb+1;
        }

        return gleb;

    };
	alert(glebokosc($(document.documentElement)));
});