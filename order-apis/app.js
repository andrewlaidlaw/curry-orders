// Prepare necessary pre-requisites
const express = require('express');
const cors = require('cors');
const os = require("os");
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const { response, json } = require('express');

// Collect database settings from environment variables
const mongoHost = process.env.DATABASE_HOST || "localhost";
const mongoPort = process.env.DATABASE_PORT || "27017";
const mongoDatabase = process.env.DATABASE_NAME || "orders";
const mongoUser = process.env.DATABASE_USER;
const mongoPassword = process.env.DATABASE_PASSWORD;
//const mongoCollection = process.env.database_collection;

const menuapiurl = process.env.MENUAPIURL || "http://localhost:8081/api/"

// const mongoDatabase = "orders";
const mongoCollection = "orders";

// Build MongoDB connection string
//================================
if (mongoUser == null) {
    // Used for local testing
    var url = "mongodb://" + mongoHost + ":" + mongoPort + "/" + mongoDatabase
} else {
    // Used for OpenShift environment
    var url = "mongodb://" + mongoUser + ":" + mongoPassword + "@" + mongoHost + ":" + mongoPort + "/" + mongoDatabase
}

console.log("MongoDB instance is at: " + url);

// Set Express.js to listen for all connections
const app = express();
app.use(cors({ origin: '*' }));
const port = 8080;
const hostname = "0.0.0.0";

// Basic response on /
app.get('/', (req, res) => {
    res.send("ok");
});

// Searches $mongoCollection collection using query modifier from HTTP query
app.get('/findone', async (req, res) => {
    async function findone(findQuery) {
        var result = ""
        try {
            await client.connect();
            console.log("connected");
            const collection = client.db(mongoDatabase).collection(mongoCollection);
            console.log("collection set as " + mongoCollection);
            result = await collection.findOne(findQuery);
            console.log("search completed");
        } finally {
            await client.close();
            console.log("client closed");
        }
        console.log("returning result:");
        console.log(result);
        res.send(result);
    }
    findone(req.query).catch(console.dir);
})

app.get('/api/order/neworder/:orderid/:name', async (req, res) => {
    let document = { "name": req.params.name, "orderid": req.params.orderid, "items": [] };
    let result = await createrecord(document);
    res.json(result);
})

app.get('/api/order/findorder/byname/:name', async (req, res) => {
    let document = { "name": req.params.name };
    let result = await findrecord(document);
    res.json(result);
})

app.get('/api/order/findorder/byid/:orderid', async (req, res) => {
    let document = { "orderid": req.params.orderid };
    let result = await findrecord(document);
    res.json(result);
})

app.get('/api/order/:orderid/additem/:productid', async (req, res) => {
    let matchdoc = { "orderid": req.params.orderid };
    let updatedoc = { $push: { "items": req.params.productid } };
    let result = await updaterecord(matchdoc, updatedoc);
    res.json(result);
})

app.get('/api/order/:orderid/removeitem/:itemid', async (req, res) => {
    let matchdoc = { "orderid": req.params.orderid };
    let updatedoc = { $pull: { "items": req.params.itemid } };
    let result = await updaterecord(matchdoc, updatedoc);
    res.json(result);
})

app.get('/api/order/:orderid/removeorder', async (req, res) => {
    let matchdoc = { "orderid": req.params.orderid };
    let result = await deleterecord(matchdoc);
    res.json(result);
})

app.get('/api/order/:orderid/bill', (req, res) => {

})

// Return a full list of everything ordered by everyone
app.get('/api/order/currentorders', async (req, res) => {
    let document = {};
    let results = await findrecords(document);
    if (results == { "notfound": true }) {
        res.json(result);
    }
    for (result in results) {
        console.log(results[result]);
    }
    let output = [];
    await getallorders(results, output);

    // function delay(time) {
    //     return new Promise(resolve => setTimeout(resolve, time));
    // }
     
    // async function printSentence() {
    //     console.log("Hello World")
    //     await delay(2000);
    //     console.log("Will be printed after 2 seconds");
    // }
     
    // await printSentence();

    res.json(output)
})

app.get('/api/order/:orderid', async (req, res) => {
    let document = { "orderid": req.params.orderid };
    let result = await findrecord(document);
    res.json(result);
})

app.get('/api/fullorder/:orderid', async (req, res) => {
    let document = { "orderid": req.params.orderid };
    let result = await findrecord(document);
    let items = await result.items;
    let itemdetails = [];
    let pricetotal = 0;
    let allitems = await menuitemlookup(items, itemdetails, pricetotal);
    // console.log(allitems);
    result.itemdetails = allitems.itemdetails;
    result.pricetotal = allitems.pricetotal;
    res.json(result);
})

app.get('/api/allorders/:name', async (req, res) => {
    let matchdoc = { "name": req.params.name };
    let result = await findrecords(matchdoc);
    res.json(result);
})

app.get('/api/allorders', async (req, res) => {
    let result = await findrecords();
    res.json(result);
})


// Healthcheck on /healthz
app.get('/healthz', (req, res) => {
    res.send('ok');
});

// Shows the URL of the MongoDB instance
app.get('/url', (req, res) => {
    res.send(url);
});



// Functions for interacting with MongoDB database
// As used in the endpoints above

async function createrecord(document) {
    console.log("Creating new order for " + JSON.stringify(document.name));
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const collection = client.db(mongoDatabase).collection(mongoCollection);
        result = await collection.insertOne(document);
    } finally {
        await client.close();
        return result;
    }
}

async function findrecord(matchdoc) {
    console.log("Searching for an order matching: " + JSON.stringify(matchdoc));
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const collection = client.db(mongoDatabase).collection(mongoCollection);
        result = await collection.findOne(matchdoc);
        if (result == null) {
            result = { "notfound": true };
        }
    } finally {
        await client.close();
        return result;
    }
}

async function findrecords(matchdoc) {
    console.log("Searching for all order matching: " + JSON.stringify(matchdoc));
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const collection = client.db(mongoDatabase).collection(mongoCollection);
        result = await collection.find(matchdoc).toArray();
        if (result.length == 0) {
            result = { "notfound": true };
        }
    } finally {
        await client.close();
        return result;
    }
}

async function updaterecord(matchdoc, updatedoc) {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const collection = client.db(mongoDatabase).collection(mongoCollection);
        result = await collection.updateOne(matchdoc, updatedoc);
        if (result.result.nModified == 0) {
            result = { "notfound": true };
        }
    } finally {
        await client.close();
        return result;
    }
}

async function deleterecord(matchdoc) {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const collection = client.db(mongoDatabase).collection(mongoCollection);
        result = await collection.deleteOne(matchdoc);
    } finally {
        await client.close();
        return result;
    }
}

async function menulookup(item) {
    let url = menuapiurl + 'menu/' + item;
    // console.log(url);
    let output = {};
    try {
        const urlresponse = await fetch(url);
        output = await urlresponse.json();
    } catch (err) {
        console.error(err.message);
    } finally {
        output.itemid = item;
        // console.log(output);
        return output;
    }
}

async function menuitemlookup(items, itemdetails, pricetotal) {
    let result = {};
    try {
        for (item in items) {
            let menuitem = await menulookup(items[item]);
            await itemdetails.push(menuitem);
            pricetotal = await pricetotal + parseFloat(menuitem.itemprice);
        }
        result.itemdetails = itemdetails;
        result.pricetotal = pricetotal;
    } catch (err) {
        console.error(err.message);
    } finally {
        return result;
    }
}

async function menuitemcategorisation(items, itemdetails) {
    let result = {};
    try {
        for (item in items) {
            let menuitem = await menulookup(items[item]);
            // Categorise all of the menu items into Starter / Main / Rice / Drink / Other
            if (menuitem.category == "Starters") {
                if (result.starter) {
                    result.starter = result.starter + ", " + menuitem.itemname;
                } else {
                    result.starter = menuitem.itemname;
                }
            } else if (menuitem.category == "Tandoori Selection") {
                if (result.main) {
                    result.main = result.main + ", " + menuitem.itemname;
                } else {
                    result.main = menuitem.itemname;
                }
            } else if (menuitem.category == "Chefs Specials") {
                if (result.main) {
                    result.main = result.main + ", " + menuitem.itemname;
                } else {
                    result.main = menuitem.itemname;
                }
            } else if (menuitem.category == "Indian City Special") {
                if (result.main) {
                    result.main = result.main + ", " + menuitem.itemname;
                } else {
                    result.main = menuitem.itemname;
                }
            } else if (menuitem.category == "Old Favourites") {
                if (result.main) {
                    result.main = result.main + ", " + menuitem.itemname;
                } else {
                    result.main = menuitem.itemname;
                }
            } else if (menuitem.category == "Vegetarian Specials") {
                // work with starter / main split
                console.log(menuitem.itemname.slice(-4));
                if (menuitem.itemname.slice(-4) == "main") {
                    if (result.main) {
                        result.main = result.main + ", " + menuitem.itemname;
                    } else {
                        result.main = menuitem.itemname;
                    }
                } else {
                    if (result.starter) {
                        result.starter = result.starter + ", " + menuitem.itemname;
                    } else {
                        result.starter = menuitem.itemname;
                    }
                }
                
            } else if (menuitem.category == "Chefs Vegetable Speciality") {
                if (result.main) {
                    result.main = result.main + ", " + menuitem.itemname;
                } else {
                    result.main = menuitem.itemname;
                }
            } else if (menuitem.category == "Rice") {
                if (result.rice) {
                    result.rice = result.rice + ", " + menuitem.itemname;
                } else {
                    result.rice = menuitem.itemname;
                }
            } else if (menuitem.category == "Naan Breads") {
                if (result.other) {
                    result.other = result.other + ", " + menuitem.itemname;
                } else {
                    result.other = menuitem.itemname;
                }
            } else if (menuitem.category == "Side orders") {
                if (result.other) {
                    result.other = result.other + ", " + menuitem.itemname;
                } else {
                    result.other = menuitem.itemname;
                }
            }
            await itemdetails.push(menuitem);
        }
        result.itemdetails = itemdetails;
    } catch (err) {
        console.error(err.message);
    } finally {
        return result;
    }
}

async function getallorders(orders, output) {
    try {
        for (order in orders) {
            let itemdetails = [];
            let allitems = await menuitemcategorisation(orders[order].items, itemdetails);
            let thisorder = {};
            thisorder.name = await orders[order].name;
            thisorder.starter = await allitems.starter;
            thisorder.main = await allitems.main;
            thisorder.rice = await allitems.rice;
            thisorder.drinks = await allitems.drinks;
            thisorder.other = await allitems.other;
            thisorder.id = order;
            await output.push(thisorder);
        }
    } catch (err) {
        console.error(err.message);
    } finally {
        return "done";
    }
}

// Deploy web server and log status
app.listen(port, hostname, () => {
    console.log(`MongoDB app listening at http://${hostname}:${port}`)
});