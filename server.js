'use strict';
require('dotenv').config();
const express= require('express');
const app= express();
const superagent= require('superagent');
const PORT= process.env.PORT;
const pg= require('pg');
const client= new pg.Client(process.env.DATABASE_URL);
const methodOverride= require('method-override');

app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.get('/', homeHandler);
app.get('/favs', favHandler);
app.post('/save', saveHandler);
app.get('/details/:id', detailHandler);
app.put('/update/:id', updateHandler);
app.delete('/delete/:id', deleteHandler);
app.get('/search', searchHandler);
app.get('/result', resultHnadler);
app.get('*', errorHandler);


function homeHandler(req, res){
    let url= 'https://digimon-api.herokuapp.com/api/digimon';
    superagent.get(url)
    .then(data=>{
        let digimonArr= data.body.map(details=>{
            return new Digimon(details);
        })
        res.render('home', {digimons: digimonArr});
    })
}
function favHandler(req, res){
    let SQL= 'SELECT * FROM digimons;';
    client.query(SQL)
    .then((digifav)=>{
        res.render('favs', {digifav: digifav.rows})
    })
}
function saveHandler(req, res){
    let {name, img, level}= req.body;
    let SQL= 'INSERT INTO digimons (diginame, digimg, digilevel) VALUES ($1, $2, $3);';
    let safeValues= [name, img, level];
    client.query(SQL, safeValues)
    .then(()=>{
        res.redirect('/favs');
    })
}
function detailHandler(req, res){
    let digiID= [req.params.id];
    let SQL= 'SELECT * FROM digimons WHERE id=$1;';
    client.query(SQL, digiID)
    .then(digiDetails=>{
        res.render('details', {digiDetails: digiDetails.rows[0]});
    })
}
function updateHandler(req, res){
    let digiID= req.params.id;
    let {diginame, digilevel}= req.body;
    let SQL= 'UPDATE digimons SET diginame=$1, digilevel=$2 WHERE id=$3;';
    let safeValues= [diginame, digilevel, digiID];
    client.query(SQL, safeValues)
    .then(()=>{
        res.redirect('/favs');
    })
}
function deleteHandler(req, res){
    let digiID= [req.params.id];
    let SQL= 'DELETE FROM digimons WHERE id=$1;';
    client.query(SQL, digiID)
    .then(()=>{
        res.redirect('/favs');
    })
}
function searchHandler(req, res){
    res.render('search');
}
function resultHnadler(req, res){
    let search= req.body.keyword;
    let url='';
    if(req.body.choice === 'name'){
        url= `https://digimon-api.herokuapp.com/api/digimon/name/${search}`;
    } else if(req.body.choice === 'level'){
        url= `{https://digimon-api.herokuapp.com/api/digimon/level/${search}`;
    }
    superagent.get(url)
    .then(result=>{
        res.render('result', {result: result});
    })
}
function errorHandler(req, res){
    res.status(404).send('PAGE NOT FOUND');
}

function Digimon(details){
    this.name= details.name;
    this.img= details.img;
    this.level= details.level;
}

client.connect()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Listening on PORT ${PORT}`);
    })
})