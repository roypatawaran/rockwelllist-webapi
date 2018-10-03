var moment = require('moment');

module.exports = {
    getMoviesWithAvailabiltyAndTheaterName: function(availability, movies, dateNow, theater_name) {
        if (availability.toLowerCase() == "now showing") {
            for (var i = movies.length - 1; i >= 0; i--) {
                var obj = movies[i];
                var ifNotNowShowing = false;
                for (var x = 0; x < obj.availability.length; x++) {
                    if (!moment(dateNow).isAfter(obj.availability[x].opening_date)) {
                        if (theater_name == obj.availability[x].theater_name)
                            ifNotNowShowing = true;
                    }
                }
                if (ifNotNowShowing) {
                    movies.splice(i, 1);
                }
            }
        }
        else if (availability.toLowerCase() == "coming soon") {
            for (var i = movies.length - 1; i >= 0; i--) {
                var obj = movies[i];
                var ifNotComingSoon = false;
                for (var x = 0; x < obj.availability.length; x++) {
                    if (!moment(obj.availability[x].opening_date).isAfter(dateNow)) {
                        if (theater_name == obj.availability[x].theater_name)
                            ifNotComingSoon = true;
                    }
                }
                if (ifNotComingSoon) {
                    movies.splice(i, 1);
                }
            }
        }
        return { i, obj, ifNotNowShowing, x, ifNotComingSoon };
    },
    getMovieWithAvailability: function(availability, i, movies, obj, ifNotNowShowing, x, dateNow, ifNotComingSoon) {
        if (availability.toLowerCase() == "now showing") {
            for (var i = movies.length - 1; i >= 0; i--) {
                var obj = movies[i];
                var ifNotNowShowing = false;
                for (var x = 0; x < obj.availability.length; x++) {
                    if (!moment(dateNow).isAfter(obj.availability[x].opening_date)) {
                        ifNotNowShowing = true;
                    }
                }
                if (ifNotNowShowing) {
                    movies.splice(i, 1);
                }
            }
        }
        else if (availability.toLowerCase() == "coming soon") {
            for (var i = movies.length - 1; i >= 0; i--) {
                var obj = movies[i];
                var ifNotComingSoon = false;
                for (var x = 0; x < obj.availability.length; x++) {
                    if (!moment(obj.availability[x].opening_date).isAfter(dateNow)) {
                        ifNotComingSoon = true;
                    }
                }
                if (ifNotComingSoon) {
                    movies.splice(i, 1);
                }
            }
        }
        return { i, obj, ifNotNowShowing, x, ifNotComingSoon, i, ifNotNowShowing, x, ifNotComingSoon };
    },
    getMoviesWithTheaterName: function(i, movies, obj, x, theater_name) {
        for (var i = movies.length - 1; i >= 0; i--) {
            var obj = movies[i];
            var isTheaterName = false;
            for (var x = 0; x < obj.availability.length; x++) {
                if (obj.availability[x].theater_name == theater_name) {
                    isTheaterName = true;
                }
            }
            if (!isTheaterName) {
                movies.splice(i, 1);
            }
        }
        return { i, obj, x, i, x };
    }
};