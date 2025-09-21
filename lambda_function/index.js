import fetch from "node-fetch";

export const handler = async (event) => {
    try{
        const body = JSON.parse(event.body);
        
        const res = await fetch("https://ipinfo.io/json", {})
        const json = await res.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "success", json })
        }


    } catch{
        console.log('error at handler', error.message)
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        }
    }
}