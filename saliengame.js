// ==UserScript==
// @name         Steam Salien game 2018
// @namespace    http://tampermonkey.net/
// @version      6.66
// @description  Automatic play
// @author       t0tal
// @match        https://*/saliengame/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    CEnemy.prototype.Walk = function(){this.Die(true);};
	var preferRoomNumber = 48;
    var joiningZone = false;
    var gameCheck = function(){
        if (!gGame || !gGame.m_State) return;

        if (gGame.m_State instanceof CBootState && gGame.m_State.button) {
            startGame();
            return;
        }

        if (gGame.m_State.m_VictoryScreen || gGame.m_State.m_LevelUpScreen) {
            gGame.ChangeState( new CBattleSelectionState( gGame.m_State.m_PlanetData.id ) );
            console.log('game clear');
            return;
        }

        if (gGame.m_State.m_EnemyManager) {
            joiningZone = false;
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