const Movies = require('../models/cinemas');
var Cinemas_Summary = require('../models/cinemas_summary');
var moment = require('moment');
var pagination = require('../utils/pagination');
var search = require('../utils/search');

module.exports = {
    addItems: async (req, res, next) => {
        try {
            const newMovies = new Movies(req.body);
            const movies = await newMovies.save();
            res.status(201).json(movies);
        } catch(err) {
            next(err);
        }
    },
    getAll: async (req, res, next) => {
        try {
            var availability = req.query.availability;
            var theater_name = req.query.theater_name;
            var top = (req.query.top == 'true');
            var limit = parseInt(req.query.limit);
            var start_id = req.query.start_id;
            var dateNow = new Date();
            var movies = [];
            var params = {
                            name: {$exists:true}, 
                            item_type: {$exists:true},
                            writeup: {$exists:true},
                            image_url: {$exists:true},
                            booking_url: {$exists:true}
                        };
            movies =  await Movies.find(params).sort({"name": 1});

            if(typeof availability != "undefined" && typeof theater_name != "undefined")
            {
                var { i, obj, ifNotNowShowing, x, ifNotComingSoon } = search.getMoviesWithAvailabiltyAndTheaterName(availability, movies, dateNow, theater_name); 
            }
            else if(typeof availability != "undefined" && typeof theater_name == "undefined")
            {
                var i;
                var obj;
                var ifNotNowShowing;
                var x;
                var ifNotComingSoon;
                ({ i, obj, ifNotNowShowing, x, ifNotComingSoon, i, ifNotNowShowing, x, ifNotComingSoon } = search.getMovieWithAvailability(availability, i, movies, obj, ifNotNowShowing, x, dateNow, ifNotComingSoon)); 
            }
            else if(typeof availability == "undefined" && typeof theater_name != "undefined")
            {
                var i;
                var obj;
                var x;
                ({ i, obj, x, i, x } = search.getMoviesWithTheaterName(i, movies, obj, x, theater_name));
            }

            if(typeof start_id != "undefined" || !isNaN(limit))
            {
                var sorted_movies = top == true ? pagination.sortItemsWithFeatured(movies) : movies;
                var _movies = pagination.chunkArray(sorted_movies, limit);
                var movie_index = pagination.getItemChunkIndex(_movies, start_id);
                var next_id = pagination.getNextId(_movies, movie_index);
                var _data = _movies[movie_index];
                var data = [];
                
                for(var a = 0; a < _movies[movie_index].length; a++)
                {
                    var _movieSummary = {
                        "_id": _data[a]._id,
                        "item_type": _data[a].item_type,
                        "name":_data[a].name,
                        "writeup":_data[a].writeup,
                        "image_url": _data[a].thumbnail_url,
                        "booking_url": _data[a].booking_url
                    };
                    data.push(_movieSummary);
                }

                var movie_summary = {
                    "pagination": {
                        "next": next_id
                    },
                    "data": data
                };

                res.status(200).json(movie_summary);
            }
            else
            {
                var sorted_movies = top == true ? pagination.sortItemsWithFeatured(movies) : movies;
                var _movies = [];
                for(var a = 0; a < sorted_movies.length; a++)
                {
                    var _movieSummary = {
                        "_id": movies[a]._id,
                        "item_type": movies[a].item_type,
                        "name":movies[a].name,
                        "writeup":movies[a].writeup,
                        "image_url": movies[a].image_url,
                        "booking_url": movies[a].booking_url
                    };
                    _movies.push(_movieSummary);
                }

                var movie_summary = {
                    "pagination": {},
                    "data": _movies
                };
                res.status(200).json(movie_summary);
            }
        } catch(err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        const { movieId } = req.params;

        try {
            var movies = await Movies.findById(movieId, { "__v" : 0, "availability._id" : 0 });
            var _availability = [];
            for(var x = 0; x < movies.availability.length; x++)
            {
                var temp = {
                    "opening_date": movies.availability[x].opening_date.getTime(),
                    "theater_name": movies.availability[x].theater_name
                }
                _availability.push(temp);
            }

            var _data = {
                "_id": movies._id,
                "name": movies.name,
                "booking_url": movies.booking_url,
                "trailer_url": movies.trailer_url,
                "item_type": movies.item_type,
                "render_type": movies.render_type,
                "availability": _availability,
                "mtrcb_rating": movies.mtrcb_rating,
                "genre": movies.genre,
                "description": movies.description,
                "writeup": movies.writeup,
                "image_url": movies.image_url
            };
        

            res.status(200).json(_data);
        } catch(err) {
            next(err);
        }
    },
    updateById: async(req, res, next) => {
        const { movieId } = req.params;
        try{
            const movie = await Movies.findOneAndUpdate({_id: movieId}, req.body);
            res.status(200).json(movie);
        }
        catch(err){
            next(err);
        }
    },
    deleteById: async(req, res, next) => {
        const { movieId } = req.params;
        try{
            Movies.findByIdAndRemove(movieId, (err, todo) => {
                const response = {
                    message: "Movie successfully deleted",
                    id: todo._id
                };
                return res.status(200).send(response);
            });
        }
        catch(err){
            next(err);
        }
    },
    getByFeatured: async (req, res, next) => {
        try {
            const movies = await Movies.find({featured:true}).sort({"name": 1});
            res.status(200).json(movies);
        } catch(err) {
            next(err);
        }
    }
}

