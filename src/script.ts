import { HTMLToJSON } from 'html-to-json-parser'; // ES6
import { number } from 'prop-types';
import * as cheerio from 'cheerio';
import { $ } from 'bun';



// 1) Fetch the raw HTML
// 2) save the raw HTML (do we need to save this or can we immediately clean it? Why do we need to save the raw html?)
// 3) clean the raw HTML
// 4) parse HTML (cleaned html --> extract links)

//fetch the raw html 
async function fetchHTML(url: string): Promise<string> {
    try {

        const response = await fetch(url); // create a constant that fetches the url 
        const contentType = response.headers.get('content-type');


        let data; // initiate data variable

        if (contentType && contentType.includes('text/html')) {
            data = await response.text(); // get body text of url as html if headers include html

        }
        else if (contentType && contentType.includes('application/json')) {
            data = await response.json(); //get body text of url as json if headers include json
        }
        else {
            throw new Error('This content type is not supported')
        }
        return JSON.stringify(data);

    }
    catch (error) {
        console.error("Failed to get content type from URL", error);
        return '';
    }
}

const fetchWikipedia = (await fetchHTML("https://en.wikipedia.org/wiki/Wikipedia:Very_short_featured_articles"))

// console.log("the data is:", (await fetchHTML("https://en.wikipedia.org/wiki/Wikipedia:Very_short_featured_articles")))
// console.log("the data is:", (await fetchHTML("https://pokeapi.co/api/v2/pokemon/ditto")))

//fetch the size of the raw html
async function fetchHtmlSize(url: string): Promise<string | undefined> {
    try {
        const response = await fetch(url);
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            const sizeInBytes = parseInt(contentLength);
            const sizeinKilobytes = sizeInBytes / 1024;

            return sizeinKilobytes.toFixed(2);
        }
        else {
            throw new Error('Content-header length not found');
        }
    } catch (error) {
        console.error("Failed to get file size from URL", error);

    }
}

// console.log("the data size is:", (await fetchHtmlSize("https://en.wikipedia.org/wiki/Main_Page")), "KB")
// console.log("the data size is:", (await fetchHtmlSize("https://pokeapi.co/api/v2/pokemon/ditto")), "KB")


//parse the raw html
function getAnchorTags(html: string): string[] | undefined {
    const $ = cheerio.load(html)
    const findLinks = $('a')
    console.log(findLinks.get())
    const retrieveHREF = findLinks.map((index, element) => {
        // console.log(element)
        return $(element).attr('href');
    })
    console.log(retrieveHREF.get())
    // console.log()
    const getHREFS = retrieveHREF.get();
    return getHREFS
}


const newData = getAnchorTags(fetchWikipedia)
console.log(newData)

// console.log(fetchWikipedia)