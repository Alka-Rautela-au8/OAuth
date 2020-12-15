// when we want to login into some xyz.com we don't create an account in xyz.com 
// instead we log into that website using third party application (Github, Facebook, google)

// 1. log into your github account
// 2. go to settings
// 3. click on developer settings
// 4. click on oAuth 
// 5. create a new oAuth app (provide url of your app and callback url of your app, where you want to redirect user after authentication)
// 6. once user enters username and password to github, we will query github for code from our application using client id and client secret
// 7. after getting code , we can send a post request to github for getting access_token of user by adding client_id, client_secret and code as query in url
// Note: Every user will have one code

const dotenv = require('dotenv')
const express = require('express')
const ejs = require('ejs')
const axios = require('axios')

// initialize app
const app = express()

// Load env variables
dotenv.config({path:'./config/config.env'})

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const port = process.env.PORT || 2400

let access_token = "";

// using ejs for rendering template dynamically
app.set('view engine', 'ejs')

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

// Home Page
app.get('/', function(req, res){
    res.render('pages/index', {client_id, client_secret})
})

// Declaring the callback route
app.get('/github/callback', (req, res) => {
    // we will get code inside req.query.code
    const requestToken = req.query.code;
    console.log("request token", requestToken)
    axios({
        method: 'POST',
        url: `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${requestToken}`,
        headers: {accept: 'application/json'}
    }).then(response =>{
        access_token = response.data.access_token;
        console.log("access_token", access_token)
        res.redirect('/success');
    })
})

app.get('/success', function(req, res){
    axios({
        method: 'GET',
        url : 'https://api.github.com/user',
        headers:{
            Authorization: `token ${access_token}`
        }
    }).then(response => {
        console.log("response.data", response.data)
        res.render('pages/success', {userData: response.data})
    }).catch(err => {
        console.log(err)
    })
})