import express from 'express'
import bodyParser from 'body-parser'

import {getClinic} from './weiClinic'
import {getClinicService} from "./weiClinicService";

const app = express()

app.use(bodyParser.json())
app.use(function (_req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.get('/digitize', async (req, res) => {
    const gender = req.query.gender
    const age = parseInt(req.query.age)
    const name = req.query.name

    const createdElements = await getClinicService().createAsync(gender, name, age)
    res.status(200).set({ 'Content-Type': 'application/json' }).json(createdElements)
})

app.post('/remove/:stackId', async (req, res) => {
    const stackId = req.params.stackId;
    const stackFound = getClinic().findStack(stackId);

    if (!stackFound || !stackFound.idEnvelope) {
        return res.status(400).end()
    }

    await getClinicService().removeStackFromEnvelopeAsync(stackFound)
    res.status(204).end()
})

app.put('/implant/:stackId/:envelopeId?', async (req, res) => {
    const stackId = parseInt(req.params.stackId)
    const existingStack = getClinic().findStack(stackId)
    const envelopeId = parseInt(req.params.envelopeId)

    if (!existingStack) {
        return res.status(400).end()
    }

    if(!!envelopeId) {
        if (!getClinic().findEnvelope(envelopeId)) {
            return res.status(404).end()
        }

        await getClinicService().assignStackToEnvelopeAsync(existingStack, envelopeId)
        return res.status(204).end()
    }

    const firstAvailableEnvelope = getClinic().envelopes.find(envelope => envelope.idStack === null)
    if (!firstAvailableEnvelope) {
        return res.status(400).end()
    }

    await getClinicService().assignStackToEnvelopeAsync(existingStack, firstAvailableEnvelope.id)
    res.status(204).end()
})

app.post('/kill/:envelopeId', async (req, res) => {
    const envelopeId = parseInt(req.params.envelopeId)

    const envelopeFound = getClinic().findEnvelope(envelopeId)
    if (!envelopeFound) {
        return res.status(400).end()
    }

    await getClinicService().killEnvelopeAsync(envelopeFound)
    res.status(204).end()
})

app.delete('/truedeath/:stackId' ,async (req, res) => {
    const stackId = parseInt(req.params.stackId);

    const existedStackFound = getClinic().findStack(stackId)
    if (!existedStackFound) {
        return res.status(400).end()
    }

    await getClinicService().destroyStackAsync(existedStackFound)
    res.status(204).end()
})

export default app
