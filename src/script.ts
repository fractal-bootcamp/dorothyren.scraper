import { HTMLToJSON } from 'html-to-json-parser'; // ES6

// 1) Fetch the raw HTML
// 2) save the raw HTML (do we need to save this or can we immediately clean it? Why do we need to save the raw html?)
// 3) clean the raw HTML
// 4) parse HTML (cleaned html --> extract links)

async function fetchHTML(url: string): Promise<string> {
    try {

        const response = await fetch(url); // create a constant that fetches the url 
        const contentType = response.headers.get('content-type');

        let data;

        if (contentType && contentType.includes('text/html')) {
            data = await response.text(); // get body text of the url as a json
        }
        else if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }
        else {
            throw new Error('This content type is not supported')
        }
        return JSON.stringify(data);

    }
    catch (error) {
        console.error("this is an error message", error);
        return '';
    }
}

console.log("the data is:", (await fetchHTML("https://en.wikipedia.org/wiki/Main_Page")))
console.log("the data is:", (await fetchHTML("https://pokeapi.co/api/v2/pokemon/ditto")))