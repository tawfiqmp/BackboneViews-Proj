(function(window, undefined) {
    "use strict";

    var uberView = Backbone.View.extend({
        tagName: "div",
        className: "uberVenue",
        initialize: function(opts) {
            // 1. Sometimes it will be instantiated without options, so to guard against errors:
            this.options = _.extend(
                {},
                {
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
        template: "<h1>{name}</h1><hr><ul><li>{location.lat}</li><li>{location.lng}</li></ul>",
        render: function(){
            this.el.innerHTML = _.template(this.template, this.options);
        }
    })

    function UberClient(options) {
        this.options = _.extend({}, options, {
            server_token: "U67tkPnc_tsni5pAv54vCDjKnXI6geek9fenFndn",
            api_key: "AIzaSyB1najZ5yX92F823qZLgpr-4G2phsIQgrc",
        });

        this.init();
    }

    UberClient.prototype.geoConversion = function() {
    	var url = [
    		"https://maps.googleapis.com/maps/api/geocode/json",
    		"?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=",
    		this.options.api_key

    	];

    };

    UberClient.prototype.queryAPI = function(coordinates) {
        var url = [
            "/uber/v1/products",
            "?server_token=",
            this.options.server_token,
            "&latitude=",
            coordinates.coords.latitude,
            '&longitude=',
            coordinates.coords.longitude
        ];

        return $.get(url.join('')).then(function(data){
        	console.log(data);
            return arguments;
        });
    };


    UberClient.prototype.getGeo = function() {
        var promise = $.Deferred();
        navigator.geolocation.getCurrentPosition(function(){
            promise.resolve(arguments[0]);
        });
        return promise;
    };

    UberClient.prototype.makeUberRequest = function(coordinates) {
        $.when(
            this.queryAPI(coordinates)
        ).then(function(){
            if(
                !arguments[0] ||
                !arguments[0].response ||
                !arguments[0].response.venues ||
                !(arguments[0].response.venues instanceof Array)
            ){
                throw new Error("array of venues not piped from queryAPI");
            }

            arguments[0].response.venues.forEach(function(data){
                new fsVenueView(data);
            })

        })
    };

    UberClient.prototype.init = function() {
        var self = this;
        this.getGeo().then(function(coordinates){

            self.makeUberRequest(coordinates);

        })
    };

    window.UberClient = UberClient;
})(window, undefined);