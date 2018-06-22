// ==UserScript==
// @name         Steam Salien game 2018
// @namespace    http://tampermonkey.net/
// @version      6.67
// @description  Automatic play
// @author       t0tal
// @match        https://*/saliengame/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    CEnemy.prototype.Walk = function(){this.Die(true);};
	var zonePosition = 35;
	var preferRoomNumber = 48;
	var joiningPlanet = false;
    var joiningZone = false;
    var gameCheck = function(){
        if (!gGame || !gGame.m_State) return;

        if (gGame.m_State instanceof CBootState && gGame.m_State.button) {
            startGame();
            return;
        }
		
        if (gGame.m_State.m_VictoryScreen || gGame.m_State.m_LevelUpScreen) {
			gGame.ChangeState( new CBattleSelectionState( gGame.m_State.m_PlanetData.id ) );
            console.log('game clear. current planet id = '+gGame.m_State.m_PlanetData.id);
            return;
        }

        if (gGame.m_State.m_EnemyManager) {
            joiningZone = false;
			joiningPlanet = false;
            return;
        }

        if (gGame.m_State.m_PlanetData && gGame.m_State.m_PlanetData.zones) {
            var uncapturedZones = gGame.m_State.m_PlanetData.zones
                .filter(function(z){ return !z.captured })
                .sort(function(z1, z2){return z2.difficulty - z1.difficulty});

            if (uncapturedZones.length == 0) {
                console.log("No uncaptured zones!");
                return;
            }
			//check if preferRoomNumber is not captured yet, use it
			if(uncapturedZones.indexOf(preferRoomNumber)<0)
                preferRoomNumber = uncapturedZones[0].zone_position;
            joinZone(preferRoomNumber);
            return;
        }
    };

    var intervalFunc = setInterval(gameCheck, 1000);
	var joinPlanet = function(planetId) {
		if(joiningPlanet) return;
		console.log('Joining planet:', planetId);
		joiningPlanet = true;
		clearInterval(intervalFunc);
		gServer.JoinPlanet(
			planetId,
			function ( response ) {
				gGame.ChangeState( new CBattleSelectionState( planetId ) );
			},
			GameLoadError
		);
		
		setTimeout(functioN() {
			intervalFunc = setInterval(gameCheck, 1000);
		}, 10000);
	}
    var joinZone = function(zoneId) {
        if (joiningZone) return;
        console.log('Joining zone:', zoneId);

        joiningZone = true;

        clearInterval(intervalFunc);

        gServer.JoinZone(
            zoneId,
            function ( results ) {
                gGame.ChangeState( new CBattleState( gGame.m_State.m_PlanetData, zoneId ) );
            },
            GameLoadError
        );

        setTimeout(function() {
            intervalFunc = setInterval(gameCheck, 1000);
        }, 10000);
    };

    var startGame = function() {
        console.log('Pressing Play');

        clearInterval(intervalFunc);

        gGame.m_State.button.click()

        setTimeout(function() {
            intervalFunc = setInterval(gameCheck, 1000);
        }, 5000);
    };
})();
