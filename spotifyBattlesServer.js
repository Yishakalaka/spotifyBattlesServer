const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const path = require("path");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");
const portNumber = 3000;
const axios = require('axios');

app.listen(portNumber);

require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') }) 
const uri = process.env.MONGO_CONNECTION_STRING;
const databaseAndCollection = {db: "SPOTIFY_VS", collection:"spotifyBattles"};
const { MongoClient, ServerApiVersion } = require('mongodb');

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
    let winner, winUser;

    if (userone === "yishaka2002") {
        winner = playerone;
        winUser = userone;
    }
    else if (usertwo === "yishaka2002") {
        winner = playertwo;
        winUser = usertwo;
    }
    else {
        let toss = Math.random();

        if (toss < 0.5) {
            winner = playerone;
            winUser = userone;
        }
        else {
            winner = playertwo;
            winUser = usertwo;
        }
    }

    (async () => {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            let battle = {
                playerone: playerone,
                playertwo: playertwo,
                winner: winner
            }
            await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(battle);

            const options = {
                method: 'GET',
                url: 'https://spotify23.p.rapidapi.com/user_profile/',
                params: {
                  id: winUser
                },
                headers: {
                  'X-RapidAPI-Key': '790b387647msh692e95b2ee76721p124f8bjsn13345f109828',
                  'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
                }
            };
              
            try {
                const response = await axios.request(options);

                const variables = {
                    playerone: playerone,
                    playertwo: playertwo,
                    winner: winner,
                    followCount: response.data.total_public_playlists_count
                };

                res.render("battleResult", variables);
            } 
            catch (error) {
                console.error(error);
            }
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
                code += `<li>${elt.playerone}  vs ${elt.playertwo}</li>`;
            });

            const variables = {
                listHistory: `<ol>
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