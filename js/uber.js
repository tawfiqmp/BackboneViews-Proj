(function(window, undefined) {
    "use strict";

    var uberView = Backbone.View.extend({
        tagName: "div",
        className: "uberVenue",
        initialize: function(opts) {
            // 1. Sometimes it will be instantiated without options, so to guard against errors:
            this.options = _.extend({}, {
                    $container: $('body')
                },
                opts
            );

            // 2. Part of putting a view into its initial state is to put its element
            //    into the DOM. Its container should be configurable using an option
            //    so that a) it can be used anywhere in the app and b) it can be
            //    easily unit tested.
            this.options.$container.append(this.el);

            // 3. Render the content of the view
            this.render();
        },
        template: "<h2>{display_name}</h2><hr><ul><li>Distance: {distance} mi</li><li>{estimate}</li></ul>",
        render: function() {
            this.el.innerHTML = _.template(this.template, this.options);
        }
    })

    function UberClient(options) {
        "use strict";
        this.options = _.extend({}, options, {
            server_token: "U67tkPnc_tsni5pAv54vCDjKnXI6geek9fenFndn",
            api_key: "AIzaSyB1najZ5yX92F823qZLgpr-4G2phsIQgrc",
        });

        //this.init();
        this.setupRouting();
    }

    UberClient.prototype.createInputObject = function() {
        "use strict";
        var input = {};
        $(':input').each(function() {
            input[this.name] = this.value;
        });

        console.dir(input);
        return input;
    };

    UberClient.prototype.geoStartingConversion = function() {
        "use strict";

        var input = this.createInputObject();

        var url = [
            "https://maps.googleapis.com/maps/api/geocode/json",
            "?address=",
            input.startingAddress,
            "&key=",
            this.options.api_key
        ];
        return $.get(url.join('')).then(function(data) {
            console.log(data.results[0].geometry.location);
            return data.results[0].geometry.location;
        })
    };


    UberClient.prototype.geoEndingConversion = function() {
        "use strict";

        var input = this.createInputObject();

        var url = [
            "https://maps.googleapis.com/maps/api/geocode/json",
            "?address=",
            input.endingAddress,
            "&key=",
            this.options.api_key
        ];
        return $.get(url.join('')).then(function(data) {
            console.log(data.results[0].geometry.location);
            return data.results[0].geometry.location;
        })
    };


    UberClient.prototype.queryAPI = function(startingCoordinates, endingCoordinates) {
        "use strict";
        var url = [
            "/uber/v1/estimates/price",
            "?server_token=",
            this.options.server_token,
            "&start_latitude=",
            startingCoordinates.lat,
            "&start_longitude=",
            startingCoordinates.lng,
            "&end_latitude=",
            endingCoordinates.lat,
            "&end_longitude=",
            endingCoordinates.lng
        ];

        return $.get(url.join('')).then(function(data) {
            console.log(data.prices);
            return data.prices;
        });
    };

    UberClient.prototype.timeEstimate = function(startingCoordinates) {
        "use strict";
        var url = [
            "/uber/v1/estimates/time",
            "?server_token=",
            this.options.server_token,
            "&start_latitude=",
            startingCoordinates.lat,
            "&start_longitude=",
            startingCoordinates.lng,
        ];

        return $.get(url.join('')).then(function(data){
        	console.log(data.times);
        	return data.times;
        });
    };

    UberClient.prototype.makeUberRequest = function(startingCoordinates, endingCoordinates) {
        "use strict";
        $.when(
            this.queryAPI(startingCoordinates, endingCoordinates),
            this.timeEstimate(startingCoordinates)
        ).then(function() {

            arguments[0].forEach(function(newData) {
                new uberView(newData);
            })

        })
    };

    UberClient.prototype.setupRouting = function() {
        "use strict";
        var self = this;
        Path.map("#/results").to(function() {
            $.when(
                self.geoStartingConversion(),
                self.geoEndingConversion()
            ).then(function(startingCoordinates, endingCoordinates) {
                self.makeUberRequest(startingCoordinates, endingCoordinates);

            });
        });

        Path.root("#/");
        Path.listen();

    };
    window.UberClient = UberClient;
})(window, undefined);
