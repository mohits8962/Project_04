const urlModel = require("../model/url")
const shortId = require("short-id")

let validUrl = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)\.[a-z]{2,5}(:[0-9]{1,5})?(\/.)?$/

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}


// ===========================================================================create url========================================================

const createUrl = async function (req, res) {

    try {
        let longUrl=req.body.longUrl

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "please enter a link as a value" })

        }
        if (!validUrl.test(longUrl)) {
            return res.status(404).send({ status: false, msg: "please enter a valid url" })
        }

        let url = await urlModel.findOne({longUrl})

        if (url) {
            return res.status(200).send({ status:true, message: "url already exist", data:data })
        } else {
            let urlCode = shortId.generate().toLowerCase()

            let shortUrl = "http://localhost:3000/" + urlCode

            let savedData = { longUrl, shortUrl, urlCode }
            let saveUrl = await urlModel.create(savedData)

            result = {
                longUrl: saveUrl.longUrl,
                shortUrl: saveUrl.shortUrl,
                urlCode: saveUrl.urlCode
            }
            return res.status(201).send({ status: true, msg: "succesfully generated", data: result })

        }

    }

    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}


module.exports = {createUrl}