const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const dotenv = require('dotenv');
// Load env variables
dotenv.config({path:'./config/config.env'})
const PORT = process.env.PORT || 2400

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

// Middleware // automatically looks for folder called views 
app.set('view engine', 'ejs');
// body parser --> allows us to send json back to our backend from frontend
app.use(express.json());
// cookies parser is used for setting cookies in the browser where we will store access token
app.use(cookieParser()); 

// health check
app.get('/', (req, res) => {
    res.status(200).send('Health Ok')
})

// login route
app.get('/login', (req, res) => {
    res.render('pages/login')
})

// send token and verify user
app.post('/login', (req, res) => {
    let token = req.body.token;
    console.log(token)

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];
        console.log("payload", payload)
      } 
      verify().then(() => {
          res.cookie('session-token', token);  // creating session-token cookie
          res.send('success');  // on success dashboard page will be rendered
      }).catch(console.error);
})

app.get('/dashboard', checkAuthenticated, (req, res)=>{
    let user = req.user;
    res.render('pages/dashboard', {user});
})


// logout --> clear cookie from session
app.get('/logout', (req, res) => {
    res.clearCookie('session-token')  
    res.redirect('/login')
})

// check whether the use is authenticated or not
function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  
        });
            const payload = ticket.getPayload();
            user.name = payload.name;
            user.email = payload.email;
            user.picture = payload.picture;
        }
        verify()
        .then(()=>{
            req.user = user;
            next();
        })
        .catch(err=>{
            console.log("ERROR----->", err.message)
            res.redirect('/login')
        })

}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})



