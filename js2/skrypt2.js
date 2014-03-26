$(function () { 
	 var teksty = function (root) {
        var children = $(root).children();
		var text = "";
		while(children.length > 0){
			for(var i =0; i < children.length; i++){
				if(children[i].nodeType === 3){
					text += children[i].data + " ";
				}
			}
            children = $(children).contents();
        }
        return text;
    };
	alert(teksty($(document.documentElement)));
});