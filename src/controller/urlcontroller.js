const urlModel = require("../model/url")
const shortId = require('shortid')
const validUrl = require('valid-url')
const { promisify } = require('util')
const redis = require("redis");

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

const baseUrl = "http://localhost:3000/"

// ===========================================================================

const redisClient = redis.createClient(
    16136,
    "redis-16136.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("FSQIhOzf2A9WQRJvl2vLABBBbavZkFtL", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

// ===========================================================================create url========================================================

const createUrl = async function (req, res) {

    try {
        let longUrl = req.body.longUrl

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter a link as a value" })

        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(404).send({ status: false, msg: "please enter a valid url" })
        }

        // let findLongUrl = await urlModel.findOne({ longUrl })
        let cacheData = await GET_ASYNC(`${longUrl}`)

        // if (findLongUrl) {
        if (cacheData) {
            // return res.status(200).send({ status: true, message: "url already exist", shortUrl: findLongUrl.shortUrl })
            let cacheUrlData = JSON.parse(cacheData)
            let data = {
                longUrl: cacheUrlData.longUrl,
                shortId: cacheUrlData.shortUrl,
                urlCode: cacheUrlData.urlCode
            }
            return res.status(200).send({ status: true, message: "url already exist", data: data })
        } else {
            let urlCode = shortId.generate().toLowerCase()

            let shortUrl = baseUrl + urlCode

            let savedData = { longUrl, shortUrl, urlCode }
            let saveUrl = await urlModel.create(savedData)

            let result = {
                longUrl: saveUrl.longUrl,
                shortUrl: saveUrl.shortUrl,
                urlCode: saveUrl.urlCode
            }
            await SET_ASYNC(`${longUrl}`, JSON.stringify(result))
            return res.status(201).send({ status: true, msg: "successfully generated", data: result })
        }

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


const getUrl = async function (req, res) {

    try {
        let urlCode = req.params.urlCode

        // let url1 = await urlModel.findOne({ urlCode })
        let url = await GET_ASYNC(`${urlCode}`)

        // if (url1) {
        if (url) {
            return res.status(200).redirect(JSON.parse(url).longUrl)
            // return res.status(200).redirect(url1.longUrl)
        }

        let url1 = await urlModel.findOne({ urlCode })
        if(url1){
            await SET_ASYNC(`${urlCode}`,JSON.stringify(url1))
            return res.status(200).redirect(url1.longUrl)
        }

        else {
            return res.status(404).send({ status: false, msg: "short url not found" })
        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createUrl, getUrl }
