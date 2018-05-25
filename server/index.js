////=============BACK END SERVER JS===================================
////==================================================================
////=======PULLING IN EXTERNAL STUFF NEEDED===========================
////==================================================================
// require express module
const express = require('express');
// to send http request to api
const axios = require('axios');
// create the express server 'app'
const app = express();

////==================================================================
////=======SET UP MIDDLEWARE==========================================
////==================================================================
// express as middleware - where are the static files
app.use(express.static('./public'));
// to overcome cross origin request error (port 3000 to port 8080)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

////==================================================================
////=======OTHER GLOBAL VARIABLES=====================================
////==================================================================

// to introduce an element of variety to data retrieved
const generateRandomNumber = function (number) {
    const numberBaseline = 1;
    randomNumber = ( 
        Math.floor(
            Math.random() * (number - numberBaseline + 1)
        ) + 
        numberBaseline 
    );  
    return randomNumber;
};

// number of items in search results
const limit = 10;

////==================================================================
////======SET UP SERVER ENDPOINTS AND API CALLS=======================
////==================================================================

// use this for test calls
// app.get('/', function(req, res) {
//     // quick tests
//     let pTest = axios.get(`https://api.spreaker.com/v2/shows/1554244/episodes?limit=3`);
//     pTest.then(result => {
//         console.log(result.data);
//         // let randomIndex = generateRandomNumber(limit-1);
//         // let randomList = result.data.response.items[randomIndex];
//         // let randomListId = randomList.list_id;
//         res.json(result.data);
//     })
//     .catch(error => {
//         console.log(error);
//     });
// });

app.get('/', function(req, res) {

    // Retrieving Curated Lists
    let pManyList = axios.get(`https://api.spreaker.com/v2/explore/lists?country=US&limit=${limit}`);
    pManyList.then(result => {
        let randomIndex = generateRandomNumber(limit-1);
        let randomList = result.data.response.items[randomIndex];
        let pOneList = axios.get(`https://api.spreaker.com/v2/explore/lists/${randomList.list_id}/items?${limit}`);
        return pOneList;
    })
    // Just one List of Shows
    .then(result => {
        res.json(result.data);
    })
    .catch(error => {
        console.log(`Couldn't get data from source because of error:\n ${error}`);
    })

});

// get show episodes
app.get('/show/:showId', function(req, res) {
    // Expecting a Show ID to pull in episodes related to that show
    let showId = req.params.showId;
    let pShowEps = axios.get(`https://api.spreaker.com/v2/shows/${showId}/episodes?limit=${limit}`);
    pShowEps.then(result => {
        res.json(result.data);
    })
    .catch(error => {
        console.log(`Couldn't get data from source because of error:\n ${error}`);
    })
});

////to search results
app.get('/search', function(req, res){
    // console.log('search endpoint hit');
    // access the search parameters, which was sent by browser as an object
    // console.log(req.query);
    let sQueryObject = req.query;
    let searchShow = sQueryObject.searchShow
    let pSearch = axios.get(`https://api.spreaker.com/v2/search?type=shows&q=${encodeURIComponent(searchShow)}&limit=${limit}`);
    // let pSearch = axios.get(`https://api.spreaker.com/v2/search?type=episodes&q=${encodeURIComponent(searchShow)}&limit=3`);

    pSearch.then(result => {
            // console.log('retrieving info now from spreaker api');
            // check what was received
            // console.log(result);
            // which specific thing needed in the object?
            // the search results... result.data.response
            let searchResults = result.data.response
            // console.log(searchResults);
            // as response, give back object containing...
            // 1. searchResults
            // 2. searchShow can be added below, because below is just an object we can add things to
            //  this gives us ability to reference what the user entered on search
            res.json( {podcasts : searchResults, searchShow : searchShow } );
        })
        .catch(error => {
            console.log(`Couldn't get data from source because of error:\n ${error}`);
        })
});

//// note that the next_url in response can provide a way to access next page of results
// result.data.response.next_url

//catch invalid paths/endpoints requested/sent by the browser
app.get('*', (req, res) => {
    res.send (`you landed in an invalid endpoint in the server`);
});

////==================================================================
//SET UP THE SERVER -- LAUNCH IT BY MAKING IT LISTEN TO PORT 8080=====
////==================================================================
// start the server
app.listen(8080, function() {
    console.log('Server Started on http://localhost:8080');
});