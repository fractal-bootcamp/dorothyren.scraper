import * as cheerio from 'cheerio';

const $ = cheerio.load('<h2 class="title">Youre psycho</h2>');

console.log($('h2.title').text());