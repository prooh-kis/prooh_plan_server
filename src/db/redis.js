import { createClient } from 'redis';

const redisClient = await createClient({
    url: "redis://default:f3lXavd91wvK1UL4LTj2rIQDYNXfjr4s@redis-11343.c278.us-east-1-4.ec2.redns.redis-cloud.com:11343"
})
    .on('error', err => console.log('Redis Client Error', err))
    .on('ready', res => console.log('Redis Connected', res))
    .connect();

export const getData = async (key) => {
    console.log(key);
    const exists = await redisClient.exists(key)
    if (exists == 1) {
        const data = await redisClient.get(key)
        return JSON.parse(data)
    }
    return null
}

export const setData = async ( key , data ) => {
    const response = await redisClient.set(key, JSON.stringify(data))
    return response
}

export const setDataExpiry = async ( key , expiry , data ) => {
    const response = await redisClient.setEx(key, expiry, JSON.stringify(data))
    return response
}