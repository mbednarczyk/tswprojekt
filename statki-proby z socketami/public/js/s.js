var gracze = new Array();
var nowa_plansza= function(rozmiar, id){
	var	obj = new Array();
	for(var i=0; i<rozmiar; i++){
		obj[i] = new Array();
		for(var j=0; j<rozmiar; j++){
			obj[i][j] = 0;
		}
	}
	obj.id = id;
	obj.do_html= function(){return plansza_html(this); };
	return obj;
}


var plansza_html= function(d){
	var tab = '<table id="'+d.id +'">';
	for(var i=0; i<d.length; i++){
		tab +='<tr>'
			for(var j=0; j<d.length; j++){
				if(d[i][j]===0){
					tab+='<td id="'+d.id+ i+'_'+j  +'" class="empty"></td>';
				}else if(d[i][j]===1){
					tab+='<td id="'+ d.id+ i+'_'+j  +'" class="statek"></td>';
				}else{
					tab+='<td id="'+ d.id+ i+'_'+j  +'" > </td>';
				}
			}
		tab+='</tr>'
	}
	return tab;
}

var generuj_plansze = function(d){
	for(var i=0; i<d.il_graczy; i++){
		gracze[i] = nowa_plansza(d.rozmiar, i);
	}
}

var sprawdz_ustawienia = function(d){
	if(d.il_graczy>4 || d.il_graczy <1){
		return('nieprawidlowa ilosc graczy')
	}else if(d.rozmiar>15 || d.rozmiar < 5){
		return('zly rozmiar planszy')
	}else{
		return 1;
	}
}
var uwaga = function(tresc){
	$('#uwaga').html(tresc); 
}

var startuj_gre = function(d){
	generuj_plansze(d);
	$('#ustawienia').css('right', '0');
	$('#main').css('width', '75%');
	var obj = '';
	for(var i=0; i<d.il_graczy; i++){
		obj += gracze[i].do_html();
	}	
	$('#main').html(obj);
}

var potwierdz_start = function(d){
	if(confirm('rozmiar: ' + d.rozmiar +
				' graczy: ' + d.il_graczy +
				'czy startowac ?')){
					startuj_gre(d)
				}
	else{
		uwaga('start odwolany')
	}
}

$(function(){
	$('#ustawienia form').submit(function(e){
		e.preventDefault();	
		var ustawienia = {
			'il_graczy' : $('#il_graczy').val(),
	'rozmiar' : $('#rozmiar').val()
		}
		var test = sprawdz_ustawienia(ustawienia);
		if(test === 1){
			potwierdz_start(ustawienia);
		}else{
			uwaga(test);
		}
	});
});
