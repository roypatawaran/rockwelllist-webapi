const Items = require('../models/tenants');
const pagination = require('../utils/pagination');
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
            var items = [];

            if(typeof name_like == "undefined")
            {
                items =  await Items.find(typeof category != "undefined" ? {item_type: category}: {}).populate('similar_items', 'name', Items).sort({"name": 1});
            }
            else{
                items = await Items.find(typeof category != "undefined" ? {item_type: category, name: {$regex: new RegExp(name_like, 'i')}}: {name: {$regex: new RegExp(name_like, 'i')}})
                                   .populate('similar_items', 'name', Items)
                                   .sort({"name": 1});
            }

            if(typeof start_id != "undefined" || !isNaN(limit))
            {
                var _items = pagination.chunkArray(items, limit);
                var item_index = pagination.getItemChunkIndex(_items, start_id);
                var next_id = pagination.getNextId(_items, item_index);

                var item_summary = {
                    "pagination": {
                        "next": next_id
                    },
                    "data": _items[item_index]
                };

                res.status(200).json(item_summary);
            }
            else
                res.status(200).json(items);
            
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
    }
}

