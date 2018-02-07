const googleMapsClient = require('@google/maps').createClient({
    key: process.env.KEY
});

const moment = require('moment');
moment.locale('it');

const notifier = require('node-notifier');
const emoji = require('node-emoji');
const fs = require('fs');

var next_time = 0;
var notify = {};

function metro(departure) {
    //console.log(departure);
    googleMapsClient.directions({
        origin: process.env.ORIGIN,
        destination: process.env.DESTINATION,
        mode: 'transit',
        transit_mode: 'subway',
        transit_routing_preference: 'fewer_transfers',
        departure_time: departure

    }, function (err, response) {
        if (!err) {
            try {

                var steps = response.json.routes[0].legs[0].steps;

                for (var s in steps) {
                    //console.log('step ' + s);

                    if (steps[s].travel_mode == 'TRANSIT') {
                        //console.log(steps[s]);
                        //console.log('Transit: ' + steps[s].transit_details.line.name);
                        //console.log(steps[s].transit_details.departure_time.value);

                        var td = steps[s].transit_details;

                        //console.log(td.departure_time.value);
                        var metro_departure_time = moment.unix(td.departure_time.value);
                        var metro_departure_name = td.departure_stop.name;

                        var metro_arrival_time = moment.unix(td.arrival_time.value);
                        var metro_arrival_name = td.arrival_stop.name;

                        var stops = td.num_stops
                    }
                }


                console.log('Metro per ' + metro_arrival_name + ' da ' + metro_departure_name + ' (' + stops + ' fermate)');
                console.log('Parte alle: ' + metro_departure_time.format('HH:mm:ss') + ' tra ' + metro_departure_time.fromNow('mm'));
                console.log('Arriva alle: ' + metro_arrival_time.format('HH:mm:ss'));


                var between = (metro_departure_time.valueOf() - moment().valueOf()) / (1000 * 60);

                var icon = '/img/ok.png';

                if (between <= 15) {
                    icon = '/img/warning.png';
                    if (between <= 5) {
                        icon = '/img/shit.png';
                    }
                }


                if (next_time == 0) {
                    notify = {
                        title: metro_departure_name + ' - ' + metro_arrival_name + ' (' + stops + ')',
                        subtitle: 'In ' + metro_departure_time.fromNow('mm'),
                        message: emoji.get('tram') + ' ' + metro_departure_time.format('HH:mm') + ' -> ' + metro_arrival_time.format('HH:mm'),
                        sound: 'Glass',
                        icon: __dirname + icon,
                        wait: false
                    }
                    next_time = metro_departure_time.unix();
                    metro(next_time);
                }
                else {
                    notify.message += '     ' + emoji.get('tram') + ' ' + metro_departure_time.format('HH:mm') + ' -> ' + metro_arrival_time.format('HH:mm'),
                        notifier.notify(notify);
                }
            }
            catch (error) {
                console.log(error);
            }
        }
    });
}

metro(moment().unix());