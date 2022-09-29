var express = require("express");
var seneca = require("seneca")();
var plugin = require("./product-storage.js");
seneca.use(plugin);
seneca.use("seneca-entity");

let RequestCountForGet = 0;
let RequestCountForPost = 0;
seneca.add("role:api, cmd:product", function (args, done) {
    //Below thing is for Post method handling
    if (args.req$.method == "POST") {
        RequestCountForPost++;
        console.log("> products POST: received request")
        var product = {
            product: args.product,
            price: args.price,
            category: args.category,
        };
        seneca.act({
                role: "product",
                cmd: "add",
                data: product
            },
            function (err, message) {
                console.log("< products POST: sending response")
                done(err, message);
            }
        );
    }
    //Below thing is for Get method handling
    if (args.req$.method == "GET") {
        RequestCountForGet++;
        console.log("> products GET: received request")
        seneca.act({
            role: "product",
            cmd: "get-all"
        }, function (err, message) {
            console.log("< products GET: sending response")
            done(err, message);
        });
    }
    //Below thing is for Delete method handling
    if (args.req$.method == "DELETE") {
        console.log("> products DELETE: received request")
        seneca.act({
            role: "product",
            cmd: "get-all"
        }, function (err, message) {
            for (const item of message) {
                seneca.act({
                        role: "product",
                        cmd: "delete",
                        id: item.id
                    },
                    function (err, message) {}
                );
            }
            console.log("< products DELETE: sending response")
            done(err, {
                message: "Product Deleted successfully."
            });
        });
    }
    console.log(`Processed Request Count--> Get:${RequestCountForGet}, Post:${RequestCountForPost}`)
    
});

seneca.act("role:web", {
    use: {
        prefix: "/api",
        pin: {
            role: "api",
            cmd: "*"
        },
        map: {
            product: {
                GET: true,
                POST: true,
                DELETE: true
            },
        },
    },
});

var app = express();
app.use(require("body-parser").json());
app.use(seneca.export("web"));
const HOST = "127.0.0.1"
const PORT = 3009;
app.listen(PORT, HOST, function(){
    console.log(`Server listening at ${HOST}:${PORT}`);
    console.log("Endpoints: ");
    console.log(`Method: POST :  http://${HOST}:${PORT}/api/product`);
    console.log('payload example: {“product”:”Laptop”, “price”:201.99, “category”:”PC”}');
    console.log(`GET METHOD: http://${HOST}:${PORT}/api/product`);
    console.log(`DELETE METHOD: http://${HOST}:${PORT}/api/product`);
});