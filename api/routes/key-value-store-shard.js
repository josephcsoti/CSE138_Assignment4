const fetch = require('node-fetch');
const waitUntil = require('wait-until');
const express = require('express')
var FormData = require('form-data');

const STATUS_OK = 200;
const STATUS_ERROR = 400;
const STATUS_DNE = 404;
const STATUS_CREAT = 201;
const STATUS_DOWN = 503;
const TIMEOUT = 5000
const RETRIES = 5
const CAUSALMETA = "causal-metadata"

function routeGetIDs (req, res) 
{
    let listShards = Object.keys(globalShards)
    let message = 
    {
	"message" : "Shard IDs retrieved successfully",
    	"shard-ids" : listShards,
    }

    res.status(STATUS_OK).send(message)
}

function routeGetNodeID (req, res) 
{
    let message = 
    {
	"message" : "Shard ID of the node retrived successfully",
        "shard-id" : thisID,
    }

    res.status(STATUS_OK).send(message)
}

function routeGetShardMembers (req, res) 
{
    let key = req.params['key'] 
    
    let message = 
    {
    "message" : "Members of shard ID retrieved successfully",
    "shard-id-members:": globalShards[key]
    }

    res.status(STATUS_OK).send(message)
}

function handleForwardResponse(res, f_res, json_f_res){
    //console.log("Response from server was:", f_res)
    //console.log("STATUS = "+ f_res.status)
    res.status(f_res.status).send(json_f_res)
}

function handleErrorResponse(res, method, error){

    if(error.errno == 'EHOSTUNREACH')
        res.status(STATUS_DOWN).send({'error': "Main instance is down", 'message': `Error in ${method}`})
}

function routeGetNumKeysInShard(req, res)
{
    let key = req.params['key']
    let len = Object.keys(DB).length
    
    if(key != thisID)
    {
        let url = `http://${globalShards[key][0]}/key-value-store-shard/shard-id-key-count/${key}`
                // let body = {'socket-address': hostname, 'node': true}
                fetch(url, {
                    method: 'GET',
                    // body: JSON.stringify(body),
                    headers: {'Content-Type': 'application/json'}
                })
                .then(f_res => f_res.json().then(json_f_res => handleForwardResponse(res, f_res, json_f_res)))
                .catch(error => handleErrorResponse(res, req.method, error))
    } else
    {
        let message = 
        {
        "message" : "Key count of shard ID retrieved successfully",
        "shard-id-key-count": len,
        }

        res.status(STATUS_OK).send(message)
    }
    
}



module.exports = 
{
    routeGetIDs: routeGetIDs,
    routeGetNodeID: routeGetNodeID,
    routeGetShardMembers: routeGetShardMembers,
    routeGetNumKeysInShard: routeGetNumKeysInShard
}
