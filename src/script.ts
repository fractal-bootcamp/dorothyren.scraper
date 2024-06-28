import * as cheerio from 'cheerio';
import * as fs from "fs"
import { program } from "commander";



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

// parse the raw html
function extractLinks(html: string, linkvolume: number): string[] {
    const $ = cheerio.load(html)
    const findAnchors = $('a')

    const retrieveHREF = findAnchors.map((index, element) => {
        // from all the 'a' anchor tags, find the 'hrefs'
        //clean the hrefs by taking the initial "\\"" with empty string
        //this is helpful later on when we address depth and need to access each link
        return $(element).attr('href')?.replaceAll(`\\"`, '');
    })

    // store the hrefs we retrieved from the html in an array
    const getHREFS = retrieveHREF.get();

    if (getHREFS.length < linkvolume) {
        getHREFS.slice(0, linkvolume)
        console.log("go to the next depth");
    }
    else if (getHREFS.length === linkvolume) {
        return getHREFS;
    }
    else { return getHREFS.slice(0, linkvolume); }

    return getHREFS;
}


const newData = extractLinks(fetchWikipedia, 10)

// console.log(fetchWikipedia)

//create an output directory that will hold the cleaned HTML content 
const makeOutputDirectory = (() =>
    !fs.existsSync(`./src/scrapedData`) && fs.mkdirSync(`./src/scrapedData`, { recursive: true }))
makeOutputDirectory();


//write data into the output directory that holds the cleaned HTML content
// const filePath = './src/scrapedData/data.html'
// const sampleData = 'this is some sample data im creating for seeding the data.html file'

// fs.writeFile(filePath, sampleData, (err) => {
//     if (err)
//         console.log(err);
//     else {
//         console.log('file written successfully \n');
//     }
// })

async function scrapeSite(url: string, depth: number, linkvolume: number) {
    if (depth <= 0) {
        console.log("reached maximum depth");
        return;
    }

    //fetches HTML from url
    const rawHTML = await fetchHTML(url);

    //if there is rawHTML extracted from the URL, then...
    if (rawHTML) {
        //extract the links using the extract links function written above
        const fileLinks = extractLinks(rawHTML, linkvolume);
        //create a directory to put the extracted links in
        makeOutputDirectory();

        //initialize the output directory path from the directory made above
        const filePath = `./src/scrapedData/${depth}.txt`;
        //if there are links, join them and break at the end of each link 
        //OR if there are no links, respond with links not found
        const scrapedData = fileLinks?.join('\n') || "links were not found"

        //write the file using the file path made above. 
        //add in the scraped data 
        //write a callback function that passes an error message if there is an error
        fs.appendFile(filePath, scrapedData, (err) => {
            if (err)
                console.log(err);
            else {
                console.log('file written successfully \n');
            }
        });
        // if depth is greater than 0, recursively scrape each link

        //use for...of loop to iterate over elements in the fileLinks array 
        for (let link of fileLinks) {
            if (link && link.startsWith('http')) {
                scrapeSite(link, depth - 1, linkvolume);
            }
        }

    }

}

//scraper script
program
    .name('webscraper')
    .description('simple webscraper to extract links')
    .version('1.0.0');

program.command('scrape')
    .description('takes in a url, fetches HTML from that url, returns extracted links from the url and predetermined number of nested url links')
    .argument('<url>', 'URL to scrape')
    .argument('<depth>', 'Depth of nested URLs to scrape')
    .argument('<linkCount>', 'number of links to scrape from each URL')
    .action((url, depth, linkCount) => {
        scrapeSite(url, depth, linkCount)
    });

program.parse();


