const mongoose = require('mongoose');
const express = require('express');
const path = require('path')
const app = express();
const port = 3000;
const session = require('express-session'); // To manage sessions
const { time } = require('console');

app.use(express.static(path.join(__dirname, './Static')));

app.use(express.urlencoded({ extended: true }));  // To parse form data, to add data to the database

// Set up session middleware
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

///////////////// MongoDB Connection //////////////////
mongoose.connect('mongodb://127.0.0.1/bankdb');

var db = mongoose.connection;
db.on('error' ,console.error.bind(console,' MongoDB Connection error: \n\n'));
db.once('open',function(){
    console.log("DB connected")
});

//define schema and model
const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    address: String,
    state: String,
    postalcode: Number,
    dateofbirth: Date,
    ssn: Number,
    email: String,
    password: String
})
var dbusers = db.model('usercollection', userSchema);

const accountSchema = new mongoose.Schema({
    email: String,
    accountname: String,
    accountnumber: Number,
    bankname: String,
    accounttype: String,
    accountbalance: Number,
    openingdate: Date
})
var dbaccounts = db.model('accountscollection', accountSchema);

const transactionSchema = new mongoose.Schema({
    senderemail: String,
    senderbank: String,
    senderaccountnumber: Number,
    note: String,
    recipientemailaddress: String,
    recipientname: String,
    recipientbank: String,
    recipientaccountnumber: Number,
    amount: Number,
    timestamp: Date
})
var dbtransaction = db.model('transactioncollection', transactionSchema);
///////////////// End of MongoDB Connection //////////////////

//////////////// Sign in and Sign up //////////////////
app.get('/', (req, res) => {
    req.session.destroy();
    res.sendFile(path.join(__dirname, './Static/sign in.html'));
});

app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email, password);
        const user = await dbusers.findOne({ email: email });
        // console.log(user);
        if (user && user.password === password) {
            console.log('User login successful');
            req.session.myVariable = user;
            res.send('<script>alert("User login successful");window.open("/dashboard", "_self");</script>');
        } else {
            console.log('Invalid email or password');
            res.send('<script>alert("Invalid email or password");window.open("/", "_self");</script>');
        }
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).send('Error logging in user');
    }
});

app.get('/signup', (req, res) => {
    req.session.destroy();
    res.sendFile(path.join(__dirname, './Static/sign up.html'));
});

app.post('/adduser', async (req, res) => {
    try {
        // Create a new account document from form data
        const newUser = new dbusers({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            address: req.body.address,
            state: req.body.state,
            postalcode: req.body.postalcode,
            dateofbirth: req.body.dateofbirth,
            ssn: req.body.ssn,
            email: req.body.email,
            password: req.body.password
        });
        console.log(newUser);
        // Save the new book to the database
        await newUser.save();
        
        console.log('User added successfully');
        res.send('<script>alert("User added successfully");window.open("/", "_self");</script>');
        // res.redirect('/');  // Redirect to home or any other page
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).send('Error adding user');
    }
});
//////////////// End of Sign in and Sign up //////////////////

//////////////// Home Page //////////////////
app.get('/dashboard', (req, res) => {
    if(req.session.myVariable){
        res.sendFile(path.join(__dirname, './Static/dashboard.html'));
    }
    else{
        res.send('<script>alert("Please login first");window.open("/", "_self");</script>');
    }
});

app.get('/user-info', (req, res) => {
    const user = req.session.myVariable;
    console.log(user);
    if (user) {
        res.json({ 
            firstname: user.firstname,
            lastname: user.lastname, 
            email: user.email 
        });;
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});
//////////////// End of Home Page //////////////////

//////////////// My Banks //////////////////
app.get('/mybanks', (req, res) => {
    if(req.session.myVariable){
        res.sendFile(path.join(__dirname, './Static/bank_cards.html'));
    }
    else{
        res.send('<script>alert("Please login first");window.open("/", "_self");</script>');
    }
});
app.get('/api/banks', async (req, res) => {
    const user = req.session.myVariable;
    console.log(user);
    if (user) {
        try {
            const accounts = await dbaccounts.find({ email: user.email });
            if (accounts.length > 0) {
                res.json(accounts);
                console.log(accounts);
            } else {
                console.log('No account found');
                res.status(404).json({ error: 'No accounts found for user' });
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});
//////////////// End of My Banks //////////////////

//////////////// Transaction History //////////////////
app.get('/transaction_history', (req, res) => {
    if(req.session.myVariable){
        res.sendFile(path.join(__dirname, './Static/transaction_history.html'));
    }
    else{
        res.send('<script>alert("Please login first");window.open("/", "_self");</script>');
    }
});
//////////////// End of Transaction History //////////////////

//////////////// Payment Transfer //////////////////
app.get('/payment_transfer', (req, res) => {
    if(req.session.myVariable){
        res.sendFile(path.join(__dirname, './Static/payment_transfer.html'));
    }
    else{
        res.send('<script>alert("Please login first");window.open("/", "_self");</script>');
    }
});

app.get('/api/banks', async (req, res) => {
    const user = req.session.myVariable;
    console.log(user);
    if (user) {
        try {
            const accounts = await dbaccounts.find({ email: user.email });
            if (accounts.length > 0) {
                res.json(accounts);
                console.log(accounts);
            } else {
                console.log('No account found');
                res.status(404).json({ error: 'No accounts found for user' });
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});


app.post('/transfer', async (req, res) => {
    try {
        /////////// sender details ///////////
        const senderemail = req.session.myVariable.email;
        const senderbank = req.body.senderbank;
        const senderaccountnumber = req.body.senderaccountnumber;
        /////////// sender details end ///////////

        const note = req.body.note;
        
        /////////// recipeint details ///////////
        const recipientemailaddress = req.body.recipientemailaddress;
        const recipientname = req.body.recipientname;
        const recipientbank = req.body.recipientbank;
        const recipientaccountnumber = req.body.recipientaccountnumber;
        /////////// recipeint details end ///////////
        const amount = req.body.amount;
        // const status = req.body.status;
        // const type = req.body.type;
        const timestamp = Date.now();
        
        console.log(senderemail, senderbank, senderaccountnumber, note, recipientemailaddress, recipientname, recipientbank, recipientaccountnumber, amount, timestamp);
        const newTransaction = new dbtransaction({
            senderemail: senderemail,
            senderbank: senderbank,
            senderaccountnumber: senderaccountnumber,
            note: note,
            recipientemailaddress: recipientemailaddress,
            recipientname: recipientname,
            recipientbank: recipientbank,
            recipientaccountnumber: recipientaccountnumber,
            amount: amount,
            timestamp: timestamp
        });
        console.log(newTransaction);
        await newTransaction.save();
        res.send('<script>alert("Transaction successful");window.open("/dashboard", "_self");</script>');
    } catch (err) {
        console.error('Error adding transaction:', err);
        res.status(500).send('Error adding transaction');
    }
});
//////////////// End of Payment Transfer //////////////////

//////////////// Connect Account //////////////////
app.get('/connect-account', (req, res) => {
    if(req.session.myVariable){
        res.sendFile(path.join(__dirname, './Static/connect_bank.html'));
    }
    else{
        res.send('<script>alert("Please login first");window.open("/", "_self");</script>');
    }
});

app.post('/connectbank', async (req, res) => {
    try {
        // Create a new account document from form data
        const newAccount = new dbaccounts({
            email: req.session.myVariable.email,
            accountname: req.session.myVariable.firstname + " " + req.session.myVariable.lastname,
            accountnumber: req.body.accountnumber,
            bankname: req.body.bankname,
            accounttype: req.body.accounttype,
            accountbalance: req.body.accountbalance,
            openingdate: Date.now()
        });
        console.log(newAccount);
        // Save the new book to the database
        await newAccount.save();
        res.send('<script>alert("Account added successfully");window.open("/dashboard", "_self");</script>');
    }
    catch (err) {
        console.error('Error adding account:', err);
        res.status(500).send('Error adding account');
    }
});
//////////////// End of Connect Account //////////////////

app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log('User logged out');
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });