const urlModel = require("../model/url")
const shortId = require('shortid')
var validUrl = require('valid-url')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

const baseUrl = "http://localhost:3000/"


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

        let findLongUrl = await urlModel.findOne({ longUrl })

        if (findLongUrl) {
            return res.status(200).send({ status: true, message: "url already exist", shortUrl: findLongUrl.shortUrl })
        } else {
            let urlCode = shortId.generate().toLowerCase()

            let shortUrl =  baseUrl + urlCode

            let gettingUrl = new urlModel({
                longUrl,
                shortUrl,
                urlCode,
            })

            // let savedData = { longUrl, shortUrl, urlCode }
            let saveUrl = await urlModel.create(gettingUrl)

            let result = {
                longUrl: saveUrl.longUrl,
                shortUrl: saveUrl.shortUrl,
                urlCode: saveUrl.urlCode
            }
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

        let url1 = await urlModel.findOne({ urlCode })

        if (url1) {
            return res.status(200).redirect(url1.longUrl)
        }

        else {
            return res.status(404).send({ status: false, msg: "short url not found" })
        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createUrl,getUrl }
