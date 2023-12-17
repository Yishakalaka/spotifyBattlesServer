const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const path = require("path");
const bodyParser = require("body-parser");
const portNumber = 3000;

app.listen(portNumber);

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "SPOTIFY_VS", collection:"spotifyBattles"};
const { MongoClient, ServerApiVersion } = require('mongodb');

var client_id = 'b29bdd67f2884531a4dca11050912122';
var client_secret = 'b684d04c15444e54ae630fd885e013ba';

var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    var token = body.access_token;
  }
});

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/battle", (req, res) => {
    res.render("battleInfo");
});

app.post("/battle", (req, res) => {
    let {playerone, userone, playertwo, usertwo} = req.body;
    let winner;

    if (userone === "yishaka2002") {
        winner = playerone;
    }
    else if (usertwo === "yishaka2002") {
        winner = playertwo;
    }
    else {
        let toss = Math.random();

        if (toss < 0.5) {
            winner = playerone;
        }
        else {
            winner = playertwo;
        }
    }

    const variables = {
        playerone: playerone,
        playertwo: playertwo
    };

    (async () => {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(userone + " vs " + usertwo);

            const response = await fetch(`https://api.spotify.com/v1/${winner}`, {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });

            const data = await response.json();
            const img = document.querySelector("#winnerImage");

            img.src = json["images"].url;
            imageUrl.width = json["images"].width;
            imageUrl.height = json["images"].height;

            res.render("battleResult", variables);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    })();
});

app.get("/history", (req,res) => {
    (async () => {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({}).toArray();

            let code = "";
            result.forEach(elt => {
                code += `<li> ${elt} </li>`;
            });

            const variables = {
                listBattles: `<ol>
                            ${code}
                            </ol>`
            };
        
            res.render("battleHistory", variables);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    })();
});