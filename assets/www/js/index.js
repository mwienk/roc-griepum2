/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Editable settings
	agentsRefreshInterval: 5000,
	
	// Do NOT edit, these settings keep state
	menuVisible: false,
	activePage: "startpage",
	map: null,
	spectator: false,
	playerid: window.localStorage.getItem("setting_playerid"),
	settings: false,
	agentsLayer: null,
	thiefsLayer: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	// Add event listeners
        document.addEventListener('menubutton', app.onMenuButton, false);
        document.addEventListener('backbutton', app.onBackButton, false);
        
        // Start application
        app.switchPage('startpage');
        
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    
    // Handling of events
   	onMenuButton: function() {
   		console.log("Received Event: menubutton");
		var menu = document.getElementById('menu');
		if(app.menuVisible) {
			menu.setAttribute('style', 'display:none');
			app.menuVisible = false;
		} else {
			menu.setAttribute('style', 'display:block');
			app.menuVisible = true;
		}
	},
	
	onBackButton: function() {
		console.log("Received Event: backbutton");
		if(app.menuVisible) {
			document.getElementById('menu').setAttribute('style', 'display:none');
			app.menuVisible = false;
		} else if (app.activePage != "startpage") {
			app.switchPage('startpage');
		} else {
			navigator.app.exitApp();
		}
	},
	
	switchPage: function(page) {
		console.log("Received action: switch page")
		if(app.activePage != "") {
			document.getElementById(app.activePage).setAttribute('style', 'display:none');
		}
		document.getElementById(page).setAttribute('style', 'display:block');
		app.activePage = page;
		if(app.menuVisible) {
			document.getElementById('menu').setAttribute('style', 'display:none');
			app.menuVisible = false;
		}
	},
	
	getPlayer: function() {
		if(app.playerid == null || app.playerid == "") {
			app.spectator = true;
			app.playerid = prompt("Er is nog geen playerid ingesteld, voer die hier in:");
			if(app.playerid != null) {
				app.spectator = false;
				window.localStorage.setItem("setting_playerid", app.playerid);
				alert("Speler is opgeslagen.");
			}
		}
		if(app.spectator) {
			app.settings = true;
			alert("Je speelt dit spel nu in bekijkmodus, je gegevens worden dus niet bijgewerkt! Je kunt ook geen boeven zien.");
		}
	}, 
	
	loadMap: function() {
		app.getPlayer();
		if(app.settings == false) {
			app.refreshSettings();
		}
		console.log("Received action: load map");
		var myposition = new google.maps.LatLng(52.260908,6.793399); // Standard is Hengelo
		// Use the current position of the user
		navigator.geolocation.getCurrentPosition(function(position) {
			myposition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		},null);
		var mapOptions = {
				center: myposition,
				mapTypeControl: false,
				navigationControl: true,
				streetViewControl: false,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		app.map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
		setInterval("app.createAgentsLayer()",app.agentsRefreshInterval); // Agent layer
	},
	
	createThiefsLayer: function() {
		console.log("Thiefs layer refreshing");
		if(app.thiefsLayer != null) app.thiefsLayer.setMap(null);
	    app.thiefsLayer = new google.maps.FusionTablesLayer({
	        query: 
	        {
	            from: '1LtYYxL7RCyZHj8mV3syeR7MkyGDlJbIBW7hFTmk',
	            select: 'location',
	            where: "" +
	            		"'timestamp' > " + (Math.round(((new Date()).getTime() / 1000)) - 600) + " AND " +
	                   "'type' = 1 AND " +
	                   "'gameid' = '" + app.settings.gameid + "' AND " + 
	                   "'location' NOT EQUAL TO " + (-1 * Math.floor(Math.random() * 10000000)).toString(),
	            limit: 1000
	        }
	    });
	    app.thiefsLayer.setMap(app.map);
	    setTimeout(function(){
	    	console.log("Hiding thiefs layer");
	    	app.thiefsLayer.setMap(null);
	    },app.settings.visibletime * 1000);
	},
	
	createAgentsLayer: function() {
		console.log("Agents layer refreshing");
		if(app.agentsLayer != null) app.agentsLayer.setMap(null);
	    app.agentsLayer = new google.maps.FusionTablesLayer({
	        query: 
	        {
	            from: '1LtYYxL7RCyZHj8mV3syeR7MkyGDlJbIBW7hFTmk',
	            select: 'location',
	            where: "" +
	            		"'timestamp' > " + (Math.round(((new Date()).getTime() / 1000)) - 600) + " AND " +
	                   "'type' = 0 AND " +
	                   "'gameid' = '" + app.settings.gameid + "' AND " + 
	                   "'location' NOT EQUAL TO " + (-1 * Math.floor(Math.random() * 10000000)).toString(),
	            limit: 1000
	        }
	    });
	    app.agentsLayer.setMap(app.map);
	},

	refreshSettings: function() {
		 // Builds a Fusion Tables SQL query and hands the result to dataHandler()
		var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
		//var queryUrlHead = 'http://www.google.com/fusiontables/api/query?sql=';
	    var queryUrlKey  = '&callback=app.processSettings&key=AIzaSyD9DNAkA31T6POZbZuoo6ypDOoAYSdeMoM';
	    // write your SQL as normal, then encode it
	    var query = "SELECT gameid, interval, tijd_zichtbaar, ROWID FROM 1LtYYxL7RCyZHj8mV3syeR7MkyGDlJbIBW7hFTmk WHERE id = '" + 
	    				window.localStorage.getItem("setting_playerid") + "' AND " + 
	                    "'location' NOT EQUAL TO " + (-1 * Math.floor(Math.random() * 10000000)).toString() + " LIMIT 100";
	    var queryurl = encodeURI(queryUrlHead + query + queryUrlKey);
	    
	    var script = document.createElement('script');
	    script.type = 'text/javascript';
	    script.src = queryurl;
	    document.body.appendChild(script);
	    //TODO remove child?
	},
	
	processSettings: function(response) {
		if(response.rows != null) {
			app.settings = {
					gameid:		 response.rows[0][0],
					interval:    response.rows[0][1],
					visibletime: response.rows[0][2],
					rowid: 		 response.rows[0][3],
			};
			setInterval("app.createThiefsLayer()", app.settings.interval * 1000 + app.settings.visibletime * 1000); // Thief layer
			writePlayerSettingsFile();
		} else {
			alert("Er is een niet bestaand user id opgegeven.");
		}
		console.log(app.settings);
	},
	
	loadSettings: function() {
		document.getElementById('playerSettingsMessage').innerHTML = 
			"De volgende instellingen zijn bekend:" +
			"<table id=\"settings-table\">" +
				"<tr><th>Speler ID</th><td>" + app.playerid + "</td></tr>" +
				"<tr><th>Game ID</th><td>" + app.settings.gameid + "</td></tr>" +
				"<tr><th>Interval</th><td>" + app.settings.interval + "</td></tr>" +
				"<tr><th>Tijd zichtbaar</th><td>" + app.settings.visibletime + "</td></tr>" +
			"</table>";
	},
	
	resetSettings: function() {
		app.settings = false;
		app.playerid = false;
	   	window.localStorage.setItem("setting_playerid", 	"");
	   	document.getElementById('playerSettingsMessage').innerHTML = "De instellingen zijn gereset, start een nieuw spel om nieuwe instellingen op te halen";
	}
};

/***************************************
 ******* File handling functies  *******
 ***************************************/
function writePlayerSettingsFile() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, writeFileSystemCheck, fail);
}
function writeFileSystemCheck(fileSystem) {
    fileSystem.root.getFile("data/roc.griepum/player", {create: true}, writePlayerFileEntry, fail); 
}
function writePlayerFileEntry(fileEntry) {
	console.log(fileEntry.fullPath);
    fileEntry.createWriter(truncateFileWriter, fail);
    fileEntry.createWriter(writePlayerFile, fail);
}
function truncateFileWriter(writer) {
    writer.truncate(0);
    console.log("Settings file is now empty");
}
function writePlayerFile(writer) {
    writer.write(app.settings.rowid);
    console.log("Updated player ID in griepum settings file");
}
function fail(evt) {
    console.log(evt.target.error.code);
}

