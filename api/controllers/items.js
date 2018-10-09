const Items = require('../models/tenants');
const pagination = require('../utils/pagination');
var item_summary_model = require('../models/items_summary');
var mongoose = require('mongoose');

module.exports = {
    addItems: async (req, res, next) => {
        try {
            const newItems = new Items(req.body);
            const items = await newItems.save();
            res.status(201).json(items);
        } catch(err) {
            next(err);
        }
    },
    getAll: async (req, res, next) => {
        try {
            var category = req.query.category;
            var limit = parseInt(req.query.limit);
            var name_like = req.query.name_like;
            var start_id = req.query.start_id;
            var top = (req.query.top == 'true');
            var items = [];
            var similar_items = ["name", "item_type", "writeup", "location", "image_url"];

            if(typeof name_like == "undefined")
            {
                items =  await Items.find(typeof category != "undefined" ? {item_type: category}: {}).populate('similar_items', similar_items, Items).sort({"name": 1});
            }
            else{
                items = await Items.find(typeof category != "undefined" ? {item_type: category, name: {$regex: new RegExp(name_like, 'i')}}: {name: {$regex: new RegExp(name_like, 'i')}})
                                   .populate('similar_items', similar_items, Items)
                                   .sort({"name": 1});
            }

            if(typeof start_id != "undefined" || !isNaN(limit))
            {
                var sorted_items = top == true ? pagination.sortItemsWithFeatured(items) : items;
                var _items = pagination.chunkArray(sorted_items, limit);
                var item_index = pagination.getItemChunkIndex(_items, start_id);
                var next_id = pagination.getNextId(_items, item_index, items.length);
                var itemSummary = limit != 0 ? _items[item_index] : _items;
                var data = [];

                for(var x = 0; x < itemSummary.length; x++)
                {
                    var _data = new item_summary_model({
                        "item_id": itemSummary[x].item_id,
                        "item_type": itemSummary[x].item_type,
                        "name":itemSummary[x].name,
                        "writeup":itemSummary[x].writeup,
                        "image_url": itemSummary[x].thumbnail_url,
                        "location": itemSummary[x].location
                    });
                    data.push(_data);
                }
                

                var item_summary = {
                    "pagination": {
                        "next": next_id
                    },
                    "data": data
                };

                res.status(200).json(item_summary);
            }
            else{
                var sorted_items = top == true ? pagination.sortItemsWithFeatured(items) : items;
                var data = [];
                for(var x = 0; x < sorted_items.length; x++)
                {
                    var _data = new item_summary_model({
                        "item_id": sorted_items[x].item_id,
                        "item_type": sorted_items[x].item_type,
                        "name":sorted_items[x].name,
                        "writeup":sorted_items[x].writeup,
                        "image_url": typeof category != "undefined" ? sorted_items[x].thumbnail_url : sorted_items[x].image_url,
                        "location": sorted_items[x].location
                    });
                    data.push(_data);
                }
                var item_summary = {
                    "pagination": {
                    },
                    "data": data
                };
                res.status(200).json(item_summary);
            }
                
            
        } catch(err) {
            next(err);
        }
    },
    getById: async (req, res, next) => {
        const { itemId } = req.params;

        try {
            const items = await Items.findById(itemId).populate('similar_items', 'name', Items);
            res.status(200).json(items);
        } catch(err) {
            next(err);
        }
    },
    updateById: async(req, res, next) => {
        const { itemId } = req.params;
        try{
            const items = await Items.findOneAndUpdate({_id: itemId}, req.body);
            res.status(200).json(items);
        }
        catch(err){
            next(err);
        }
    },
    deleteById: async(req, res, next) => {
        const { itemId } = req.params;
        try{
            Items.findByIdAndRemove(itemId, (err, todo) => {
                const response = {
                    message: "Item successfully deleted",
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
            const items = await Items.find({featured:true}).populate('similar_items', 'name', Items);
            res.status(200).json(items);
        } catch(err) {
            next(err);
        }
    }
}

