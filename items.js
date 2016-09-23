/*
 Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function (callback) {
        "use strict";

        /*
         * TODO-lab1A
         *
         * LAB #1A: Implement the getCategories() method.
         *
         * Write an aggregation query on the "item" collection to return the
         * total number of items in each category. The documents in the array
         * output by your aggregation should contain fields for "_id" and "num".
         *
         * HINT: Test your mongodb query in the shell first before implementing
         * it in JavaScript.
         *
         * In addition to the categories created by your aggregation query,
         * include a document for category "All" in the array of categories
         * passed to the callback. The "All" category should contain the total
         * number of items across all categories as its value for "num". The
         * most efficient way to calculate this value is to iterate through
         * the array of categories produced by your aggregation query, summing
         * counts of items in each category.
         *
         * Ensure categories are organized in alphabetical order before passing
         * to the callback.
         *
         */
        var categories = [];
        var allNum = 0;
        var query = database.collection('item').aggregate([{
            $group: {
                _id: "$category",
                num: {$sum: 1}
            }
        }, {$sort: {_id: 1}}]).toArray(
            function (err, dcs) {
                assert.equal(err, null);
                assert.notEqual(dcs.length, 0);
                dcs.forEach(function (dc) {

                    allNum += dc.num;
                    categories.push(dc);
                });
                categories.unshift({_id: 'All', num: allNum});
                callback(categories);


            }
        );
    }



    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab1B
         *
         * LAB #1B:
         * Create a query to select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage should be displayed.
         * Use limit() and skip() and the method parameters: page and itemsPerPage to identify
         * the appropriate products. Pass these items to the callback function.
         *
         * Do NOT sort items.
         *
         */

        //
        // var pageItem = this.createDummyItem();
        // console.log("cat",category, "itemsPerPage", itemsPerPage);
        // for (var i=0; i<5; i++) {
        //     pageItems.push(pageItem);
        // }
        //  var pageSize= 2;
        //  var query = this.db.collection("item").find("category").skip(page * itemsPerPage).limit(itemsPerPage);
        if(category=="All")
        {
            this.db.collection("item").find().skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(err, pageItem) {

                assert.equal(err,null);
                assert.notEqual(pageItem.length,0);
                callback(pageItem);
            });
        }
        else{
        this.db.collection("item").find({"category":category}).skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(err, pageItem) {

            assert.equal(err,null);
            assert.notEqual(pageItem.length,0);
            callback(pageItem);

        });
        }


    }


    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = 0;
        if (category == "All") {
            numItems = this.db.collection("item").find().count(function (error, nbDocs) {
                numItems = nbDocs;
                callback(numItems);
            });

        }
        else {
            numItems = this.db.collection("item").find({"category": category}).count(function (error, nbDocs) {
                numItems = nbDocs;
                callback(numItems);

            });

        }
    }


    this.searchItems = function (query, page, itemsPerPage, callback) {
        "use strict";

        this.db.collection("item").find( { $text : { $search : query } } , {score: {$meta:'textScore'}}).skip(page * itemsPerPage).limit(itemsPerPage).sort({score:{$meta:'textScore'}}).toArray(function(err, pageItem) {

            assert.equal(err,null);
            callback(pageItem);
        });


    }


    this.getNumSearchItems = function (query, callback) {
        "use strict";

        var numItems = 0;

        this.db.collection("item").find( { $text : { $search : query } } ).count(function(err, pageItem) {

            assert.equal(err,null);
            numItems = pageItem;
            callback(numItems);
        });

    }


    this.getItem = function (itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */

       // var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.


       // callback(item);
        this.db.collection("item").find( { _id : itemId } ).toArray(function(err, item){

            assert.equal(err,null);
            callback(item[0]);
        });
    }


    this.getRelatedItems = function (callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function (err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function (itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        // TODO replace the following two lines with your code that will
        // update the document with a new review.
        var doc = this.createDummyItem();
        doc.reviews = [reviewDoc];
        this.db.collection("item").findOneAndUpdate(
            {"_id": itemId},
            {"$push": {reviews: reviewDoc}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
        // TODO Include the following line in the appropriate
        // place within your code to pass the updated doc to the
        // callback.
    }


    this.createDummyItem = function () {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
