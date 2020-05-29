  
global.globalView = (process.env.VIEW).split(',');
global.globalVectorClock = {}
global.globalSocketAddress = process.env.SOCKET_ADDRESS
global.DB = {}
const keyAPI = require('./api/routes/key-value-store')
const viewAPI = require('./api/routes/key-value-store-view')
const fetch = require('node-fetch');

const express = require('express')
const app = express()
const PORT = 8085

//const name = process.env.name;
//const SOCKET_ADDRESS = process.env.SOCKET_ADDRESS;
// if(FOWARDING_ADDRESS) console.log("Client: Forwarding to", FOWARDING_ADDRESS)
// else console.log("Main: -")

app.use(express.json())

app.get('/initkv', keyAPI.initDB)

app.get('/key-value-store/:key', keyAPI.routeGet)
app.put('/key-value-store/:key',  keyAPI.senderCheck, keyAPI.routePut)
app.delete('/key-value-store/:key', keyAPI.senderCheck, keyAPI.routeDelete)

app.get('/key-value-store-view', viewAPI.routeGet)
app.put('/key-value-store-view', viewAPI.routePut)
app.delete('/key-value-store-view', viewAPI.routeDelete)

console.log('initial view: ', globalView)
//console.log("SOCKET_ADDRESS = " + SOCKET_ADDRESS)
app.listen(PORT, () => console.log(`Example app listening at http://localhost:${PORT}`))
broadcastPutView()
getDB()

function broadcastPutView()
{
    console.log('running broadcastPutView()...')
    globalView.forEach(element => {
        if(element != globalSocketAddress)
        {
            let url = `http://${element}/key-value-store-view`
            let body = {'socket-address': globalSocketAddress , 'node': true}
            fetch(url, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'}
            })
            .then(res => res.json())
            .then(json => console.log(json, `\n ${globalSocketAddress} successfully PUT to the view of ${element}`))
            .catch(error => console.log(element, ' isnt running yet'))
        }
    })
}

function getDB()
{
    globalView.some(element => {
        if(element != globalSocketAddress)
        {
            let url = `http://${element}/initkv`
            let body = {'socket-address': globalSocketAddress , 'node': true}
            fetch(url, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            .then(res => res.json())
            .then(json => {
                console.log(json, `\n ${globalSocketAddress} successfully GET from the DB of ${element}`)
                DB = JSON.parse(json['value'])
                globalVectorClock = JSON.parse(json['causal-metadata'])
                console.log("type of VC", typeof(globalVectorClock))
                console.log("init DB: ", DB)
                console.log("init globalVectorClock: ", globalVectorClock)
            })
            .catch(error => {
                console.log(element, ' DB isnt running yet')
                console.log(error)
            })
        }
    })
}
