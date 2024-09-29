import { io } from "socket.io-client";
import { getData, setDataExpiry } from "./redis.js";
import { EXPIRATION_TIME_24 } from "../constants/Constant.js";
import { RearrangeScreenVideoResponse } from "../models/campaignModel.js";

var socket = io("http://localhost:4444");

export const connectWebSocket = () => {
    socket.on("connect", () => {
        console.log("Connected to Server")
        console.log(socket.id);
    });

    socket.on("disconnect", () => {
        console.log(socket.id);
    });

    socket.on("message", (m) => {
        console.log(m);
    });

    socket.on('addCricketTrigger', async (screenVideoResponse) => {
        console.log("add")
        const now = new Date();
        const hours = now.getHours();
        const key = screenVideoResponse.screenId + "_" + hours.toString()
        const data = await getData(key.toString());
        const active = data.Active
        const hold = data.Hold
        const index = hold.indexOf(screenVideoResponse);
        if (index !== -1) {
            hold.splice(index, 1);
        }
        if (!active.includes(screenVideoResponse))
            active = addAndRearrange(screenVideoResponse, active)
        data.Active = active
        data.Hold = hold
        const result = await setDataExpiry(key.toString(), EXPIRATION_TIME_24, data);
        console.log(result)
    });

    socket.on('removeCricketTrigger', async (screenVideoResponse) => {
        const now = new Date();
        const hours = now.getHours();
        const key = screenVideoResponse.screenId + "_" + hours.toString()
        const data = await getData(key.toString());
        const active = data.Active
        const hold = data.Hold
        var index = active.indexOf(screenVideoResponse);
        if (index !== -1) {
            active.splice(index, 1);
        }
        if (!hold.includes(screenVideoResponse))
            hold.push(screenVideoResponse)
        data.Active = active
        data.Hold = hold
        const result = await setDataExpiry(key.toString(), EXPIRATION_TIME_24, data);
        console.log(result)
    });
}


export const addAndRearrange = (screenVideoResponse, array) => {
    const indexArray = []
    
    for (const data of array) {
        for (const index of data.atIndex) {
            const rearrangeScreenVideoResponse = new RearrangeScreenVideoResponse(data.mediaId, index)
            indexArray.push(rearrangeScreenVideoResponse)
        }
    }
    indexArray.sort((a, b) => a.index - b.index)
    const minIndex = 0
    const maxIndex = 0
    if (indexArray.length > 0) {
        minIndex = indexArray[0].index
        maxIndex = indexArray[indexArray.length - 1].index
    }
    indexArray.push(new RearrangeScreenVideoResponse(screenVideoResponse.mediaId, maxIndex + 1))
    indexArray.push(new RearrangeScreenVideoResponse(screenVideoResponse.mediaId, (minIndex + maxIndex) / 2))
    indexArray.sort((a, b) => a.index - b.index)
    array.push(screenVideoResponse)

    for (const data of array) {
        data.atIndex = []
        var count = 0
        for (const index of indexArray) {
            if (index.mediaId == data.mediaId) {
                data.atIndex.push(count)
            }
            count++
        }
    }
    return array
}
