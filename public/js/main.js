var socket = io();
$('html').addClass('sap-hud').addClass('visible');
$(document).on('ready', function () {   
    function parse(name) {
        var result = "", tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === name) {
                result = decodeURIComponent(tmp[1]);
                break;
            }
        }
        return result;
    }    
    var odometer = parse("sap-odometer");
    if(odometer.length && $.isNumeric(odometer)){
        localStorage["sap-odometer"] = parseInt(odometer)+"";
        window.location = window.location.href.split("?")[0];     
    }
    socket.on('message', function (message) {
        var obj = JSON.parse(message);   
        if (obj.action === 'finished') {             
            enableAllButtons(obj.origin, obj.successfull, obj.message, obj.asset_value || obj.history, obj.asset_unit);
        }
    });    
    
    if(sessionStorage["panelSelected"]){
        $(sessionStorage["panelSelected"]).addClass('selected');
    }
    $(".sidebar .panel .panel-content").addClass("transition");
    $(".sidebar .panel-header").click(function () {
        var $panel = $(this).parent();
        if($panel.hasClass('selected')) {
            $panel.removeClass('selected');
            delete sessionStorage["panelSelected"];
        }
        else{
            $(".sidebar .panel").removeClass('selected'); 
            $panel.addClass('selected');
            sessionStorage["panelSelected"] = '#' + $panel.attr('id');
        }
    }); 
    
    $('#nav-icon').click(function(){
        $("html").toggleClass('menu-open');
    });         

    $('#write-asset').click(function () {  
        var asset_id = $('input#write-asset-id').val();
        var asset_value = $('input#write-asset-value').val();
        var asset_unit = $('select#write-asset-unit').val();
        if($.isNumeric(asset_value)) {
            asset_value = parseInt(asset_value);
            disableAllButtons('Write to the blockchain');
            socket.send(JSON.stringify({
                action: 'write',
                asset_id: asset_id,
                asset_value: asset_value,
                asset_unit: asset_unit
            }));
        }
        else {
            $('label#write-asset-value-label').addClass("panel-alert");
            $('select#write-asset-value').focus();
            $('#alert span').text('Please enter a numeric value');              
            $('#alert').fadeIn(300).delay(1000).fadeOut(300, function(){$('label#write-asset-value-label').removeClass("panel-alert");});
        }
        return false;
    });     

    $('#read-asset').click(function () {  
        var asset_id = $('input#read-asset-id').val();      
        disableAllButtons('Read from the blockchain');
        socket.send(JSON.stringify({
            action: 'read',
            asset_id: asset_id
        }));
        return false;
    });
    
    $('#load-history').click(function () {
        var asset_id = $('input#read-asset-id').val();
        disableAllButtons('Load history from the blockchain');
        socket.send(JSON.stringify({
            action: 'history',
            asset_id: asset_id
        }));
        return false;
    });

    function enableAllButtons(action, successfull, message, value, unit) {
        $('#alert').delay(300).fadeOut(300, function(){
            $('.panel button, .panel input[type="text"], .panel select, .panel label').removeAttr('disabled');
            if(action=="write"){
                if(successfull) {
                    $('#write-asset-value').addClass("accepted");
                    $('#accept').css("visibility","visible"); 
                    $("body, #write-asset").one("click", function() {
                        $('#write-asset-value').removeClass("accepted");
                        $('#accept').css("visibility","hidden");
                    });                          
                }
                else if(typeof message=="string" && message.indexOf("Warning: The blockchain is up-to-date")>=0) {
                    $('#write-asset-value').addClass("unchanged");
                    $('#unchange').css("visibility","visible"); 
                    $("body, #write-asset").one("click", function() {
                        $('#write-asset-value').removeClass("unchanged");
                        $('#unchange').css("visibility","hidden");
                    });                          
                }                        
                else {
                    $('#write-asset-value').addClass("rejected");
                    $('#reject').css("visibility","visible"); 
                    $("body, #write-asset").one("click", function() {
                        $('#write-asset-value').removeClass("rejected");
                        $('#reject').css("visibility","hidden");
                    });                          
                }
            }
            else if(action=="read" && successfull) {
                var val = parseInt(value) + " " + unit;
                $('input#read-asset-value').val(val);  
                $('input#odometer-value').val(val);  
            }
            else if(action=="history" && successfull) {
                var historyItemsDiv = $('#history-panel #history-items');
                historyItemsDiv.empty();
                value.forEach(function(item) {
                    historyItemsDiv.append("<div class='item'><span>" + item.timestamp + "</span><span>" + item.kilometre + " km</span></div>");
                });
            }
        }); 
    }
    
    function disableAllButtons(text) {    
        $('#alert span').text(text);        
        $('#alert').fadeIn('slow');         
        $('.panel button, .panel input[type="text"], .panel select, .panel label').attr('disabled', 'disabled');
    }    
});

var app = angular.module("assets", ['ngRoute', 'ngAnimate']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'assets.html',
            controller: 'ASSETS-CONTAINER'   
        })
		$locationProvider.hashPrefix('');
});

app.controller('ASSETS-CONTAINER', function ($scope, $route, $location) {
    angular.element(document).ready(function () {                             
        socket.on('message', function (message) {
            var obj = JSON.parse(message);
            if (obj.action === 'finished-loading') {
                $('html').addClass('finished');
                var value = "0";
                if($.isNumeric(localStorage["sap-odometer"])){
                    value = parseInt(localStorage["sap-odometer"]);
                }
                $scope.asset_value = value;
                $scope.$apply();
                $('input#write-asset-value').val(value);
            }                      
        }); 
        socket.send(JSON.stringify({
            action: 'init',
			asset_id: 'SAP000S407W212743'
        }));               
    });   
});
