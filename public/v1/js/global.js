$(document).ready(function(){
	var speakDate = new Date(2011, 11, 26, 13, 0, 0);//new Date(2014, 11, 26, 13, 0, 0)
	var date = new Date();
	if (date.getTime() < speakDate.getTime()) { /*otocit na < az to pujde ven*/
		$('.countdown-table tbody').countdown({ 
		    labels: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'], // The expanded texts for the counters 
		    labels1: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'], // The display texts for the counters if only one 
		    compactLabels: ['y', 'm', 'w', 'd'], // The compact texts for the counters 
		    whichLabels: null, // Function to determine which labels to use 
		    digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], // The digits to display 
		    timeSeparator: '', // Separator for time periods 
		    isRTL: false, // True for right-to-left languages, false for left-to-right 
		    until: speakDate, // new Date(year, mth - 1, day, hr, min, sec) - date/time to count down to 
		        // or numeric for seconds offset, or string for unit offset(s): 
		        // 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds 
		    since: null, // new Date(year, mth - 1, day, hr, min, sec) - date/time to count up from 
		        // or numeric for seconds offset, or string for unit offset(s): 
		        // 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds 
		    timezone: null, // The timezone (hours or minutes from GMT) for the target times, 
		        // or null for client local 
		    serverSync: null, // A function to retrieve the current server time for synchronisation 
		    format: 'dHMS', // Format for display - upper case for always, lower case only if non-zero, 
		        // 'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds 
		    layout: '<tr><td><span class="time{dl}">{d10}{d1}<span class="dot"></span></span></td><td><span class="time{hl}">{h10}{h1}<span class="dot"></span></span></td><td><span class="time{ml}">{m10}{m1}<span class="dot"></span></span></td><td><span class="time{sl}">{s10}{s1}</span></td></tr><tr class="sub"><td><span class="sub{sl}">{dl}</span></td><td><span class="sub{sl}">{hl}</span></td><td><span class="sub{sl}">{ml}</span></td><td><span class="sub{sl}">{sl}</span></td></tr>', // Build your own layout for the countdown 
		    compact: false, // True to display in a compact format, false for an expanded one 
		    padZeroes: true, // True to add leading zeroes 
		    significant: 0, // The number of periods with values to show, zero for all 
		    description: '', // The description displayed for the countdown 
		    expiryUrl: null, // A URL to load upon expiry, replacing the current page 
		    alwaysExpire: false, // True to trigger onExpiry even if never counted down 
		    onExpiry: start, // Callback when the countdown expires - 
		        // receives no parameters and 'this' is the containing division 
		    onTick: null, // Callback when the countdown is updated - 
		        // receives int[7] being the breakdown by period (based on format) 
		        // and 'this' is the containing division 
		    tickInterval: 1 // Interval (seconds) between onTick callbacks 
		});
	}else {
		$('.countdownlBackgroundWrapper	').hide();
	}
	//start
	function start() {
		$('.countdownlBackgroundWrapper').fadeOut(1000);
	}

	//fb share
	$('.btn').on('click', function(e){
		e.preventDefault();
		share();
	});
});